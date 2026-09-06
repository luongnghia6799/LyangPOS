import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REPO_OWNER = 'luongnghia6799';
const REPO_NAME = 'LyangPOS';


function getGitHubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  try {
    const cred = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n',
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const lines = cred.split('\n');
    for (const line of lines) {
      if (line.startsWith('password=')) {
        return line.substring('password='.length).trim();
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

async function uploadRelease() {
  console.log('\n=====================================================================');
  console.log('   * DANG TIEN HANH UP BAN CAI DAT LEN GITHUB RELEASE *');
  console.log(`   * Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log('=====================================================================\n');

  const token = getGitHubToken();
  if (!token) {
    console.warn('[!] Khong tim thay GitHub token (qua GH_TOKEN, GITHUB_TOKEN hoac Git Credential Manager).');
    console.warn('[!] Bo qua buoc tu dong upload len GitHub Release.\n');
    return;
  }

  // 1. Doc version tu tauri.conf.json
  const tauriConfPath = path.join(process.cwd(), 'src-tauri', 'tauri.conf.json');
  let version = '0.1.0';
  let productName = 'LyangPOS';
  try {
    if (fs.existsSync(tauriConfPath)) {
      const conf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
      if (conf.version) version = conf.version;
      if (conf.productName) productName = conf.productName;
    }
  } catch (e) {
    console.warn('[!] Khong the doc tauri.conf.json, dung phien ban mac dinh:', version);
  }

  const tagName = `v${version}`;
  const releaseTitle = `${productName} ${tagName}`;

  // 2. Tim file installer trong src-tauri/target/release/bundle/nsis
  const nsisDir = path.join(process.cwd(), 'src-tauri', 'target', 'release', 'bundle', 'nsis');
  if (!fs.existsSync(nsisDir)) {
    console.error('[!] Khong tim thay thu muc NSIS bundle:', nsisDir);
    return;
  }

  const files = fs.readdirSync(nsisDir);
  // Uu tien LyangPOS_byLyang.exe hoac file .exe bat ky trong thu muc nsis
  let assetFileName = files.find(f => f === 'LyangPOS_byLyang.exe') || files.find(f => f.endsWith('.exe'));
  if (!assetFileName) {
    console.error('[!] Khong tim thay file .exe trong thu muc nsis!');
    return;
  }

  const assetFilePath = path.join(nsisDir, assetFileName);
  const fileStats = fs.statSync(assetFilePath);
  const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);

  console.log(`[*] File cai dat: ${assetFileName} (${fileSizeMB} MB)`);
  console.log(`[*] Release Tag: ${tagName}`);

  const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'LyangPOS-Uploader'
  };

  // 3. Lay hoac tao Release
  let release = null;
  const getReleaseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tagName}`;
  const getRes = await fetch(getReleaseUrl, { headers });

  if (getRes.ok) {
    release = await getRes.json();
    console.log(`[*] Da tim thay Release ${tagName} (ID: ${release.id})`);
  } else if (getRes.status === 404) {
    console.log(`[*] Dang tao moi Release ${tagName}...`);
    const createReleaseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`;
    const createRes = await fetch(createReleaseUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: tagName,
        name: releaseTitle,
        body: `Bản cài đặt Windows NSIS Installer ${productName} ${tagName}\n\n- File: \`${assetFileName}\` (${fileSizeMB} MB)\n- Trình cài đặt tự động cập nhật & tối ưu hóa cho Windows.`,
        draft: false,
        prerelease: false
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('[LOI] Tao Release that bai:', errText);
      return;
    }
    release = await createRes.json();
    console.log(`[*] Tao Release ${tagName} thanh cong!`);
  } else {
    const errText = await getRes.text();
    console.error('[LOI] Khong the kiem tra Release tren GitHub:', errText);
    return;
  }

  // 4. Xoa asset cu neu trung ten de ghi de
  if (release.assets && release.assets.length > 0) {
    const existingAsset = release.assets.find(a => a.name === assetFileName);
    if (existingAsset) {
      console.log(`[*] Dang xoa asset cu (${assetFileName} - ID: ${existingAsset.id}) de ghi de...`);
      await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/assets/${existingAsset.id}`, {
        method: 'DELETE',
        headers
      });
    }
  }

  // 5. Upload asset moi
  console.log(`[*] Dang tai len ${assetFileName} (${fileSizeMB} MB) len GitHub Release...`);
  const fileBuffer = fs.readFileSync(assetFilePath);
  const uploadUrl = `https://uploads.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/${release.id}/assets?name=${encodeURIComponent(assetFileName)}`;

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileBuffer.length.toString()
    },
    body: fileBuffer
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error('[LOI] Upload file cai dat that bai:', errText);
    return;
  }

  const assetData = await uploadRes.json();
  console.log('\n=====================================================================');
  console.log('   * UPLOAD GITHUB RELEASE THANH CONG! *');
  console.log('=====================================================================');
  console.log(`[>] Release URL: ${release.html_url}`);
  console.log(`[>] Direct Download: ${assetData.browser_download_url}`);
  console.log('=====================================================================\n');
}

uploadRelease().catch(e => {
  console.error('[LOI] Xu ly upload release gap loi:', e);
});
