use tauri_plugin_shell::ShellExt;
use std::sync::Mutex;
use tauri::Manager;

struct SidecarState(Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[tauri::command]
fn open_devtools(window: tauri::WebviewWindow) {
  if window.is_devtools_open() {
    window.close_devtools();
  } else {
    window.open_devtools();
  }
}

#[tauri::command]
fn set_window_colors(background_color: String, text_color: String) -> Result<(), String> {
  // A dummy/noop command to satisfy frontend invocation
  println!("Setting window colors: bg={}, text={}", background_color, text_color);
  Ok(())
}

#[cfg(target_os = "windows")]
unsafe fn clean_process_tree(pid: u32) {
  #[link(name = "kernel32")]
  extern "system" {
    fn CreateToolhelp32Snapshot(dw_flags: u32, th32_process_id: u32) -> isize;
    fn Process32FirstW(h_snapshot: isize, lppe: *mut PROCESSENTRY32W) -> i32;
    fn Process32NextW(h_snapshot: isize, lppe: *mut PROCESSENTRY32W) -> i32;
    fn OpenProcess(dw_desired_access: u32, b_inherit_handle: i32, dw_process_id: u32) -> isize;
    fn CloseHandle(h_object: isize) -> i32;
    fn SetProcessWorkingSetSize(h_process: isize, dw_minimum_working_set_size: usize, dw_maximum_working_set_size: usize) -> i32;
  }

  #[link(name = "psapi")]
  extern "system" {
    fn EmptyWorkingSet(h_process: isize) -> i32;
  }

  #[repr(C)]
  #[allow(non_snake_case)]
  struct PROCESSENTRY32W {
    dwSize: u32,
    cntUsage: u32,
    th32ProcessID: u32,
    th32DefaultHeapID: usize,
    th32ModuleID: u32,
    cntThreads: u32,
    th32ParentProcessID: u32,
    pcPriClassBase: i32,
    dwFlags: u32,
    szExeFile: [u16; 260],
  }

  const TH32CS_SNAPPROCESS: u32 = 0x00000002;
  const PROCESS_SET_QUOTA: u32 = 0x0100;
  const PROCESS_QUERY_INFORMATION: u32 = 0x0400;

  // 1. Clean current pid
  let h_proc = OpenProcess(PROCESS_SET_QUOTA | PROCESS_QUERY_INFORMATION, 0, pid);
  if h_proc != 0 {
    EmptyWorkingSet(h_proc);
    SetProcessWorkingSetSize(h_proc, usize::MAX, usize::MAX);
    CloseHandle(h_proc);
  }

  // 2. Scan snapshot for children
  let h_snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if h_snap != -1 {
    let mut entry = PROCESSENTRY32W {
      dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
      cntUsage: 0,
      th32ProcessID: 0,
      th32DefaultHeapID: 0,
      th32ModuleID: 0,
      cntThreads: 0,
      th32ParentProcessID: 0,
      pcPriClassBase: 0,
      dwFlags: 0,
      szExeFile: [0; 260],
    };

    if Process32FirstW(h_snap, &mut entry) != 0 {
      let mut children = Vec::new();
      loop {
        if entry.th32ParentProcessID == pid {
          children.push(entry.th32ProcessID);
        }
        if Process32NextW(h_snap, &mut entry) == 0 {
          break;
        }
      }
      CloseHandle(h_snap);

      // Clean children recursively
      for child_pid in children {
        clean_process_tree(child_pid);
      }
    } else {
      CloseHandle(h_snap);
    }
  }
}

#[tauri::command]
fn clean_app_ram() -> Result<(), String> {
  #[cfg(target_os = "windows")]
  unsafe {
    #[link(name = "kernel32")]
    extern "system" {
      fn GetCurrentProcessId() -> u32;
    }
    let pid = GetCurrentProcessId();
    clean_process_tree(pid);
  }
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, Some(vec![])))
    .invoke_handler(tauri::generate_handler![set_window_colors, clean_app_ram, open_devtools])
    .setup(|app| {
      // Manage state for sidecar process
      app.manage(SidecarState(Mutex::new(None)));

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Spawn python sidecar backend
      let app_handle = app.handle();
      match app_handle.shell().sidecar("lyang-backend") {
        Ok(sidecar) => {
          #[cfg(debug_assertions)]
          let sidecar = sidecar
            .args(["--tauri", "--port", "3579", "--db", "easypos.db"])
            .env("LYANG_PORT", "3579")
            .env("LYANG_DB", "easypos.db");

          #[cfg(not(debug_assertions))]
          let sidecar = sidecar.args(["--tauri", "--port", "3579", "--db", "easypos.db"]);
          
          match sidecar.spawn() {
            Ok((mut rx, child)) => {
              // Store the child handle to clean up on exit
              let app_clone = app.handle().clone();
              if let Some(state) = app_clone.try_state::<SidecarState>() {
                if let Ok(mut guard) = state.0.lock() {
                  *guard = Some(child);
                }
              }

              tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                  match event {
                    tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                      if let Ok(s) = std::str::from_utf8(&line) {
                        println!("[Backend Output]: {}", s.trim_end());
                      }
                    }
                    tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                      if let Ok(s) = std::str::from_utf8(&line) {
                        eprintln!("[Backend Error]: {}", s.trim_end());
                      }
                    }
                    _ => {}
                  }
                }
              });
            }
            Err(e) => {
              eprintln!("Failed to spawn lyang-backend sidecar: {}", e);
            }
          }
        }
        Err(e) => {
          eprintln!("Failed to locate lyang-backend sidecar: {}", e);
        }
      }

      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app_handle, event| {
      if let tauri::RunEvent::Exit = event {
        if let Some(state) = app_handle.try_state::<SidecarState>() {
          if let Ok(mut guard) = state.0.lock() {
            if let Some(child) = guard.take() {
              let _ = child.kill();
              println!("Successfully killed lyang-backend sidecar process on exit.");
            }
          }
        }
      }
    });
}
