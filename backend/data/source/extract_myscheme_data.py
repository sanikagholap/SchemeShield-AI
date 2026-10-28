import os
import glob
import re
import sys
import hashlib
import pandas as pd
import pymupdf
from tqdm import tqdm

sys.stdout.reconfigure(encoding='utf-8')

INDIAN_STATES_UTS = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 
    'Andaman and Nicobar Islands', 'Andaman & Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 
    'Ladakh', 'Lakshadweep', 'Puducherry'
]

MINISTRIES = [
    'Ministry of Agriculture and Farmers Welfare',
    'Ministry of Chemicals and Fertilizers',
    'Ministry of Civil Aviation',
    'Ministry of Coal',
    'Ministry of Commerce and Industry',
    'Ministry of Communications',
    'Ministry of Consumer Affairs, Food and Public Distribution',
    'Ministry of Corporate Affairs',
    'Ministry of Culture',
    'Ministry of Defence',
    'Ministry of Development of North Eastern Region',
    'Ministry of Earth Sciences',
    'Ministry of Education',
    'Ministry of Electronics and Information Technology',
    'Ministry of Environment, Forest and Climate Change',
    'Ministry of External Affairs',
    'Ministry of Finance',
    'Ministry of Fisheries, Animal Husbandry and Dairying',
    'Ministry of Food Processing Industries',
    'Ministry of Health and Family Welfare',
    'Ministry of Heavy Industries',
    'Ministry of Home Affairs',
    'Ministry of Housing and Urban Affairs',
    'Ministry of Information and Broadcasting',
    'Ministry of Jal Shakti',
    'Ministry of Labour and Employment',
    'Ministry of Law and Justice',
    'Ministry of Micro, Small and Medium Enterprises',
    'Ministry of Mines',
    'Ministry of Minority Affairs',
    'Ministry of New and Renewable Energy',
    'Ministry of Panchayati Raj',
    'Ministry of Parliamentary Affairs',
    'Ministry of Personnel, Public Grievances and Pensions',
    'Ministry of Petroleum and Natural Gas',
    'Ministry of Power',
    'Ministry of Railways',
    'Ministry of Road Transport and Highways',
    'Ministry of Rural Development',
    'Ministry of Science and Technology',
    'Ministry of Ports, Shipping and Waterways',
    'Ministry of Skill Development and Entrepreneurship',
    'Ministry of Social Justice and Empowerment',
    'Ministry of Statistics and Programme Implementation',
    'Ministry of Steel',
    'Ministry of Textiles',
    'Ministry of Tourism',
    'Ministry of Tribal Affairs',
    'Ministry of Women and Child Development',
    'Ministry of Youth Affairs and Sports',
    'NITI Aayog',
    'Department of Science and Technology',
    'Department of Biotechnology',
    'Department of Atomic Energy',
    'Department of Space'
]

def clean_url(u: str, slug: str) -> str:
    if not u or not isinstance(u, str):
        return f"https://www.myscheme.gov.in/schemes/{slug}"
        
    u = u.replace('\u200b', '').replace('\ufeff', '').replace('ï»¿', '').strip()
    u = u.rstrip(".,;:)'\"")
    
    trailing_pattern = r'/(?:How|Can|What|Under|Step\d*|Sources|Guidelines|Feedback|Cancel|Apply|Check|Was|Online|Offline|Details|Eligibility|Benefits|Click)[A-Za-z0-9_]*$'
    u = re.sub(trailing_pattern, '', u, flags=re.IGNORECASE)
    
    trailing_word_end = r'(?:How|Can|What|Under|Step\d*|Sources|Guidelines|Feedback|Cancel|Apply|Check|Was|Online|Offline|Details|Eligibility|Benefits|Click)$'
    u = re.sub(trailing_word_end, '', u, flags=re.IGNORECASE)
    
    u = u.rstrip(".,;:)'\"")
    
    if not u.startswith(('http://', 'https://')) or len(u) < 10 or 'myscheme.gov.in' in u:
        return f"https://www.myscheme.gov.in/schemes/{slug}"
        
    return u

def unwrap_and_clean_text(t: str) -> str:
    """
    Cleans mojibake, unglues glued words, un-wraps middle-of-sentence line breaks,
    and structures paragraphs and bullet points cleanly.
    """
    if not t or not isinstance(t, str):
        return ""
    
    # 1. Normalize mojibake / encoding artifacts
    t = t.replace('\r', '')
    t = t.replace('\u200b', ' ').replace('\xa0', ' ').replace('\ufeff', '').replace('ï»¿', '')
    t = t.replace('â‚¹', '₹')
    t = t.replace('â€“', '-').replace('â€”', '-')
    t = t.replace('â€˜', "'").replace('â€™', "'")
    t = t.replace('â€œ', '"').replace('â€\x9d', '"').replace('â€ ', '"').replace('â€', '"')
    t = t.replace('"¢', '•').replace('â€¢', '•')
    t = t.replace('à¤¹à¤¿à¤‚à¤¦à¥€', 'हिंदी')
    
    # Clean modal / footer fragments
    t = re.sub(r'You\s*need\s*to\s*sign\s*in\s*before\s*applying.*$', '', t, flags=re.DOTALL | re.IGNORECASE)
    t = re.sub(r'Something\s*went\s*wrong\..*$', '', t, flags=re.DOTALL | re.IGNORECASE)
    t = re.sub(r'Are\s*you\s*sure\s*you\s*want\s*to\s*sign\s*out\?.*$', '', t, flags=re.DOTALL | re.IGNORECASE)
    t = re.sub(r'Ok\s*Was\s*this\s*helpful\?.*$', '', t, flags=re.DOTALL | re.IGNORECASE)
    t = re.sub(r'Was\s*this\s*helpful\?.*$', '', t, flags=re.DOTALL | re.IGNORECASE)
    t = re.sub(r'Cancel\s*Sign\s*In.*$', '', t, flags=re.DOTALL | re.IGNORECASE)
    t = re.sub(r'Cancel\s*Apply\s*Now.*$', '', t, flags=re.DOTALL | re.IGNORECASE)
    
    # 2. Fix hyphenated word breaks across lines: 'self-\nemployment' -> 'self-employment'
    t = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1-\2', t)
    
    # 3. Add space after colons and periods if glued to words
    t = re.sub(r'([a-zA-Z]):([A-Za-z0-9])', r'\1: \2', t)
    t = re.sub(r'([a-z])\.([A-Z])', r'\1. \2', t)
    t = re.sub(r'([a-zA-Z])\?([A-Z])', r'\1? \2', t)
    t = re.sub(r'([a-zA-Z])\)([A-Z])', r'\1) \2', t)
    
    # 4. Standardize headings and sections
    t = re.sub(r'([a-z0-9\.\)])\s*(Objective(?:s)?\s*(?:of\s*the\s*Scheme)?\s*:)\s*', r'\1\n\n\2\n', t, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*(Introduction\s*:)\s*', r'\1\n\n\2\n', t, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*(Background\s*:)\s*', r'\1\n\n\2\n', t, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*(Negative List(?:\s*of\s*Activities)?\s*:)\s*', r'\1\n\n\2\n', t, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*(Step\s*\d+\s*:)\s*', r'\1\n\2 ', t, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*(Process\s*\d+\s*:)\s*', r'\1\n\2 ', t, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*([•])\s*', r'\1\n• ', t)
    t = re.sub(r'([a-z0-9\.\)])\s*(\d+[\.\)])\s*(?=[A-Z])', r'\1\n• \2 ', t)

    # 5. Unwrap lines within each paragraph/bullet point
    lines = [l.strip() for l in t.split('\n')]
    merged = []
    for line in lines:
        if not line:
            continue
        is_bullet_or_header = (
            line.startswith('•') or 
            line.startswith('Q:') or 
            line.startswith('A:') or 
            line.startswith('Mode:') or 
            bool(re.match(r'^(?:Introduction:|Objective|Step\s*\d+:|Process\s*\d+:|Exclusions|Negative\s*List|Note:|\d+[\.\)])', line, re.IGNORECASE))
        )
        if is_bullet_or_header:
            merged.append(line)
        else:
            if merged and not merged[-1].endswith(':'):
                merged[-1] += ' ' + line
            else:
                merged.append(line)
                
    result = '\n'.join(merged).strip()
    result = re.sub(r'[ \t]+', ' ', result)
    result = re.sub(r'[•\s]+(Step\s*\d+\s*:?)', r'\1', result, flags=re.IGNORECASE)
    result = re.sub(r'•\s*•\s*', '• ', result)
    return result

def format_application_process(text: str) -> str:
    if not text:
        return ""
    
    t = text
    t = re.sub(r'^(OfflineOnline|OnlineOffline)\s*', r'Mode: Online & Offline\n\n', t, flags=re.IGNORECASE)
    t = re.sub(r'^Offline\s*', r'Mode: Offline\n\n', t, flags=re.IGNORECASE)
    t = re.sub(r'^Online\s*', r'Mode: Online\n\n', t, flags=re.IGNORECASE)
    
    t = re.sub(r'([a-z0-9\.\)])\s*(Step\s*\d+\s*:?)\s*', r'\1\n\2 ', t, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*(Process\s*\d+\s*:?)\s*', r'\1\n\2 ', t, flags=re.IGNORECASE)
    t = re.sub(r'(\bStep\s*\d+\s*:)\s*', r'\1 ', t, flags=re.IGNORECASE)
    t = re.sub(r'(\bProcess\s*\d+\s*:)\s*', r'\1 ', t, flags=re.IGNORECASE)
    
    return unwrap_and_clean_text(t)

def format_faqs(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    
    # Split structured Q&A
    parts = text.split('?')
    if len(parts) <= 1:
        return unwrap_and_clean_text(text)
        
    pairs = []
    curr_q = parts[0].strip()
    
    for i in range(len(parts) - 1):
        question = curr_q.strip()
        question = re.sub(r'^(?:Q\s*\d*[\.\:]?|Question\s*\d*[\.\:]?|•|\d+[\.\)])\s*', '', question, flags=re.IGNORECASE).strip()
        
        rest = parts[i+1].strip()
        if i + 1 < len(parts) - 1:
            m = re.search(r'(\.(?:\s+|\d+\.\s*)|\n\s*)([A-Z][A-Za-z0-9\s,\(\)\/\-]{3,})$', rest)
            if m:
                ans = rest[:m.start()+1].strip()
                curr_q = rest[m.start()+1:].strip()
            else:
                last_dot = rest.rfind('.')
                if last_dot != -1 and last_dot > len(rest) // 3:
                    ans = rest[:last_dot+1].strip()
                    curr_q = rest[last_dot+1:].strip()
                else:
                    ans = rest
                    curr_q = ""
        else:
            ans = rest
            curr_q = ""
            
        ans = re.sub(r'^(?:A\s*\d*[\.\:]?|Ans(?:wer)?\s*\d*[\.\:]?)\s*', '', ans, flags=re.IGNORECASE).strip()
        if question:
            pairs.append((question, ans))
            
    output_blocks = []
    for q, a in pairs:
        q_clean = unwrap_and_clean_text(q.rstrip('?') + '?')
        a_clean = unwrap_and_clean_text(a)
        output_blocks.append(f"Q: {q_clean}\nA: {a_clean}")
        
    return '\n\n'.join(output_blocks).strip()

def format_documents_required(text: str) -> str:
    if not text:
        return ""
    t = re.sub(r'^Indicative\s*Documents\s*', '', text, flags=re.IGNORECASE)
    t = re.sub(r'([a-z0-9\.\)])\s*(\d+[\.\)])\s*', r'\1\n• ', t)
    t = re.sub(r'([•\-])\s*', r'\n• ', t)
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    bulleted = []
    for l in lines:
        if not l.startswith('•') and not re.match(r'^\d+[\.\)]', l):
            bulleted.append('• ' + l)
        else:
            bulleted.append(l)
    return unwrap_and_clean_text('\n'.join(bulleted))

def parse_scheme_metadata(banner: str, scheme_name: str):
    banner_clean = re.sub(r'Check\s*Eligibility', '', banner, flags=re.IGNORECASE).strip()
    
    authority = ''
    level = 'Central Government'
    
    for m in MINISTRIES:
        m_simple = re.sub(r'[^a-zA-Z]', '', m).lower()
        b_simple = re.sub(r'[^a-zA-Z]', '', banner_clean).lower()
        if m.lower() in banner_clean.lower() or m_simple in b_simple:
            authority = m
            level = 'Central Government'
            break
            
    if not authority:
        m_gen = re.search(r'Ministry\s+Of\s+[A-Za-z\s,&]+?(?=[A-Z][a-z]+|\n|$)', banner_clean, re.IGNORECASE)
        if m_gen and len(m_gen.group(0).strip()) > 12:
            authority = m_gen.group(0).strip()
            level = 'Central Government'
            
    if not authority:
        for state in sorted(INDIAN_STATES_UTS, key=len, reverse=True):
            if re.search(r'\b' + re.escape(state) + r'\b', banner_clean, re.IGNORECASE) or state.lower() in banner_clean.lower()[:len(state)+5]:
                authority = state
                level = 'State / UT Government'
                break
                
    if not authority:
        authority = 'Central Government / All India'
        level = 'Central Government'
        
    rem = banner_clean
    if authority in rem:
        rem = rem.replace(authority, '')
    if scheme_name in rem:
        rem = rem.replace(scheme_name, '')
    
    tag_words = re.findall(r'[A-Z][a-z]+|[A-Z]+(?=[A-Z][a-z]|\b)', rem)
    tags = [w for w in tag_words if len(w) > 2 and w.lower() not in ['scheme', 'yojana', 'details', 'check', 'eligibility', 'apply', 'now']]
    seen_tags = set()
    clean_tags = []
    for tg in tags:
        if tg.lower() not in seen_tags:
            seen_tags.add(tg.lower())
            clean_tags.append(tg)
            
    tag_str = ', '.join(clean_tags) if clean_tags else ""
    return level, authority, tag_str

def parse_scheme_pdf_extended(file_path: str) -> dict:
    doc = pymupdf.open(file_path)
    full_text = '\n'.join(page.get_text() for page in doc)
    
    cleaned = full_text.replace('\u200b', ' ').replace('\xa0', ' ').replace('\ufeff', ' ').replace('ï»¿', '')
    filename = os.path.basename(file_path)
    slug = re.sub(r'(\(\d+\))?\.pdf$', '', filename)
    myscheme_link = f"https://www.myscheme.gov.in/schemes/{slug}"
    
    # 1. Scheme Title
    m_title = re.search(
        r'^(.*?)(?:Are you sure you\s+want to sign out\?|Sign\s*In\s*Back|Back\s*Details|Cancel\s*Sign\s*Out)',
        cleaned,
        re.DOTALL | re.IGNORECASE
    )
    if m_title:
        scheme_name = m_title.group(1).strip()
    else:
        scheme_name = cleaned.split('\n')[0].strip()
    scheme_name = re.sub(r'\s+', ' ', scheme_name).strip()
    if not scheme_name or len(scheme_name) < 2:
        scheme_name = slug.replace('-', ' ').title()

    # 2. Extract Core Body
    m_nav = re.search(
        r'(?:Check\s*Eligibility|CancelApply\s*Now|Sign\s*in\s*to\s*apply|Cancel\s*Apply\s*Now)',
        cleaned,
        re.IGNORECASE
    )
    body = cleaned[m_nav.end():] if m_nav else cleaned
    
    banner = ""
    m_first_details = re.search(r'Details', body, re.IGNORECASE)
    if m_first_details:
        banner = body[:m_first_details.start()].strip()
        body = body[m_first_details.start():]
        
    level, state_ministry, tags = parse_scheme_metadata(banner, scheme_name)
    
    # Cut off at FAQ / Sources / Footer
    m_end_body = re.search(
        r'(?:Frequently\s*Asked\s*Questions|Sources\s*And\s*References|OkWas this helpful\?|©202|Was this helpful\?)',
        body,
        re.IGNORECASE
    )
    core_body = body[:m_end_body.start()] if m_end_body else body

    # 3. Locate standard sections in core_body
    headers = [
        ('Details', r'Details'),
        ('Benefits', r'Benefits'),
        ('Eligibility', r'Eligibility'),
        ('Exclusions', r'Exclusions'),
        ('Application Process', r'Application\s*Process'),
        ('Documents Required', r'Documents\s*Required')
    ]
    
    spans = []
    for h_name, h_pat in headers:
        m = re.search(h_pat, core_body, re.IGNORECASE)
        if m:
            spans.append((m.start(), m.end(), h_name))
            
    spans.sort(key=lambda x: x[0])
    
    sections = {}
    for i, (s_start, s_end, h_name) in enumerate(spans):
        next_pos = spans[i+1][0] if i+1 < len(spans) else len(core_body)
        content = core_body[s_end:next_pos].strip()
        sections[h_name] = content
        
    desc = sections.get('Details', '')
    if not desc and spans:
        desc = core_body[:spans[0][0]].strip()
    desc = re.sub(r'^Details\s*', '', desc, flags=re.IGNORECASE).strip()
    
    ben = sections.get('Benefits', '')
    ben = re.sub(r'^Benefits\s*', '', ben, flags=re.IGNORECASE).strip()
    
    elig_raw = sections.get('Eligibility', '')
    elig_raw = re.sub(r'^Eligibility\s*', '', elig_raw, flags=re.IGNORECASE).strip()
    
    excl_raw = sections.get('Exclusions', '')
    excl_raw = re.sub(r'^Exclusions\s*', '', excl_raw, flags=re.IGNORECASE).strip()
    
    if not excl_raw and 'exclusion' in elig_raw.lower():
        m_excl = re.search(r'\bExclusions\b|Exclusions', elig_raw, re.IGNORECASE)
        if m_excl:
            excl_raw = elig_raw[m_excl.end():].strip()
            elig_general = elig_raw[:m_excl.start()].strip()
        else:
            elig_general = elig_raw
    else:
        elig_general = elig_raw
        
    elig_general = re.sub(r'^(?:Eligibility|Criteria|General)\s*[:\-\.]?\s*', '', elig_general, flags=re.IGNORECASE).strip()
    excl_raw = re.sub(r'^(?:Exclusions|Ineligibility|Negative List)\s*[:\-\.]?\s*', '', excl_raw, flags=re.IGNORECASE).strip()
    
    if excl_raw:
        elig_full = f"{elig_general}\n\nExclusions / Ineligibility:\n{excl_raw}".strip() if elig_general else excl_raw
    else:
        elig_full = elig_general
        
    app = sections.get('Application Process', '')
    app = re.sub(r'^Application\s*Process\s*', '', app, flags=re.IGNORECASE).strip()
    
    docs_req = sections.get('Documents Required', '')
    docs_req = re.sub(r'^Documents\s*Required\s*', '', docs_req, flags=re.IGNORECASE).strip()

    # 4. Extract FAQs
    # Look for the FAQ section in body after the main details
    matches_faq = list(re.finditer(r'Frequently\s*Asked\s*Questions', body, re.IGNORECASE))
    faqs_text = ""
    if matches_faq:
        # Choose the FAQ block that has actual content
        for m_faq in matches_faq:
            after_faq = body[m_faq.end():]
            m_next_faq = re.search(r'(?:Sources\s*And\s*References|OkWas this helpful\?|©202|Quick\s*Links|Was this helpful\?)', after_faq, re.IGNORECASE)
            candidate = after_faq[:m_next_faq.start()].strip() if m_next_faq else after_faq.strip()
            if '?' in candidate and len(candidate) > 20:
                faqs_text = candidate
                break
        if not faqs_text and matches_faq:
            after_faq = body[matches_faq[-1].end():]
            m_next_faq = re.search(r'(?:Sources\s*And\s*References|OkWas this helpful\?|©202|Quick\s*Links|Was this helpful\?)', after_faq, re.IGNORECASE)
            faqs_text = after_faq[:m_next_faq.start()].strip() if m_next_faq else after_faq.strip()
        
    # 5. Extract Application Mode
    app_lower = app.lower()
    has_online = 'online' in app_lower
    has_offline = 'offline' in app_lower
    if has_online and has_offline:
        app_mode = 'Online & Offline'
    elif has_online:
        app_mode = 'Online'
    elif has_offline:
        app_mode = 'Offline'
    else:
        app_mode = 'Direct / Not Specified'

    # 6. Extract Official Link
    url_pattern = re.compile(r'https?://[^\s<>"\'\)]+')
    all_urls = url_pattern.findall(cleaned)
    ext_urls = []
    for u in all_urls:
        c_u = clean_url(u, slug)
        if c_u != myscheme_link and c_u not in ext_urls:
            ext_urls.append(c_u)
            
    official_link = ext_urls[0] if ext_urls else myscheme_link

    return {
        'Scheme Name': unwrap_and_clean_text(scheme_name),
        'Scheme Slug': slug,
        'Level': level,
        'State / UT / Ministry': state_ministry,
        'Application Mode': app_mode,
        'Tags / Categories': tags,
        'Description': unwrap_and_clean_text(desc),
        'Eligibility Criteria': unwrap_and_clean_text(elig_full),
        'Eligibility (General)': unwrap_and_clean_text(elig_general),
        'Exclusions / Ineligibility': unwrap_and_clean_text(excl_raw),
        'Benefits': unwrap_and_clean_text(ben),
        'Application Process': format_application_process(app),
        'Documents Required': format_documents_required(docs_req),
        'Frequently Asked Questions (FAQs)': format_faqs(faqs_text),
        'Official Link': official_link,
        'MyScheme URL': myscheme_link
    }

def main():
    pdf_files = sorted(glob.glob('downloaded_data/text_data/*.pdf'))
    print(f"Total PDFs found: {len(pdf_files)}")
    
    unique_files = {}
    for p in pdf_files:
        with open(p, 'rb') as f:
            h = hashlib.sha256(f.read()).hexdigest()
        if h not in unique_files:
            unique_files[h] = p
            
    print(f"Unique PDFs to process: {len(unique_files)}")
    
    records = []
    seen_schemes = set()
    
    for h, p in tqdm(unique_files.items(), desc="Generating perfectly matching CSV and JSON datasets"):
        data = parse_scheme_pdf_extended(p)
        key = (data['Scheme Name'].lower(), data['Description'][:50].lower())
        if key in seen_schemes:
            continue
        seen_schemes.add(key)
        records.append(data)
        
    df = pd.DataFrame(records)
    print(f"\nTotal schemes extracted: {len(df)}")
    print(f"Columns in enriched dataset ({len(df.columns)}): {list(df.columns)}")
    
    out_csv = 'gov_myscheme_data.csv'
    df.to_csv(out_csv, index=False, encoding='utf-8-sig')
    print(f"\nSaved CSV to: {os.path.abspath(out_csv)}")
    
    out_json = 'gov_myscheme_data.json'
    df.to_json(out_json, orient='records', indent=2, force_ascii=False)
    print(f"Saved JSON to: {os.path.abspath(out_json)}")

if __name__ == '__main__':
    main()
