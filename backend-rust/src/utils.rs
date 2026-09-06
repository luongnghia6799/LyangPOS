pub fn remove_accents(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            'à' | 'á' | 'ạ' | 'ả' | 'ã' | 'â' | 'ầ' | 'ấ' | 'ậ' | 'ẩ' | 'ẫ' | 'ă' | 'ằ' | 'ắ' | 'ặ' | 'ẳ' | 'ẵ' => out.push('a'),
            'À' | 'Á' | 'Ạ' | 'Ả' | 'Ã' | 'Â' | 'Ầ' | 'Ấ' | 'Ậ' | 'Ẩ' | 'Ẫ' | 'Ă' | 'Ằ' | 'Ắ' | 'Ặ' | 'Ẳ' | 'Ẵ' => out.push('a'),
            'è' | 'é' | 'ẹ' | 'ẻ' | 'ẽ' | 'ê' | 'ề' | 'ế' | 'ệ' | 'ể' | 'ễ' => out.push('e'),
            'È' | 'É' | 'Ẹ' | 'Ẻ' | 'Ẽ' | 'Ê' | 'Ề' | 'Ế' | 'Ệ' | 'Ể' | 'Ễ' => out.push('e'),
            'ì' | 'í' | 'ị' | 'ỉ' | 'ĩ' => out.push('i'),
            'Ì' | 'Í' | 'Ị' | 'Ỉ' | 'Ĩ' => out.push('i'),
            'ò' | 'ó' | 'ọ' | 'ỏ' | 'õ' | 'ô' | 'ồ' | 'ố' | 'ộ' | 'ổ' | 'ỗ' | 'ơ' | 'ờ' | 'ớ' | 'ợ' | 'ở' | 'ỡ' => out.push('o'),
            'Ò' | 'Ó' | 'Ọ' | 'Ỏ' | 'Õ' | 'Ô' | 'Ồ' | 'Ố' | 'Ộ' | 'Ổ' | 'Ỗ' | 'Ơ' | 'Ờ' | 'Ớ' | 'Ợ' | 'Ở' | 'Ỡ' => out.push('o'),
            'ù' | 'ú' | 'ụ' | 'ủ' | 'ũ' | 'ư' | 'ừ' | 'ứ' | 'ự' | 'ử' | 'ữ' => out.push('u'),
            'Ù' | 'Ú' | 'Ụ' | 'Ủ' | 'Ũ' | 'Ư' | 'Ừ' | 'Ứ' | 'Ự' | 'Ử' | 'Ữ' => out.push('u'),
            'ỳ' | 'ý' | 'ỵ' | 'ỷ' | 'ỹ' => out.push('y'),
            'Ỳ' | 'Ý' | 'Ỵ' | 'Ỷ' | 'Ỹ' => out.push('y'),
            'đ' => out.push('d'),
            'Đ' => out.push('d'),
            other => {
                for lower in other.to_lowercase() {
                    out.push(lower);
                }
            }
        }
    }
    out
}

pub fn normalize_date_sqlite(date_str: &str) -> String {
    let date_str = date_str.trim();
    if date_str.is_empty() {
        return "9999-12-31".to_string();
    }

    if date_str.contains('/') {
        let parts: Vec<&str> = date_str.split('/').collect();
        if parts.len() == 3 {
            let day = format!("{:0>2}", parts[0]);
            let month = format!("{:0>2}", parts[1]);
            let mut year = parts[2].to_string();
            if year.len() == 2 {
                year = format!("20{}", year);
            }
            return format!("{}-{}-{}", year, month, day);
        }
    }

    if date_str.contains('-') {
        let parts: Vec<&str> = date_str.split('-').collect();
        if parts.len() == 3 {
            if parts[0].len() == 4 {
                return date_str.to_string();
            }
            let day = format!("{:0>2}", parts[0]);
            let month = format!("{:0>2}", parts[1]);
            let mut year = parts[2].to_string();
            if year.len() == 2 {
                year = format!("20{}", year);
            }
            return format!("{}-{}-{}", year, month, day);
        }
    }

    date_str.to_string()
}

pub fn empty_string_as_none<'de, D, T>(de: D) -> Result<Option<T>, D::Error>
where
    D: serde::Deserializer<'de>,
    T: std::str::FromStr,
    T::Err: std::fmt::Display,
{
    use serde::Deserialize;
    let opt = Option::<String>::deserialize(de)?;
    match opt.as_deref() {
        None | Some("") => Ok(None),
        Some(s) => s.parse::<T>().map(Some).map_err(serde::de::Error::custom),
    }
}
