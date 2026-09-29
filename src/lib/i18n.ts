import type { Lang } from './constants';

type Dict = Record<string, { en: string; ta: string }>;

const dict: Dict = {
  // Language select
  choose_language: { en: 'Choose Your Language', ta: 'உங்கள் மொழியைத் தேர்வு செய்யவும்' },
  english: { en: 'English', ta: 'ஆங்கிலம்' },
  tamil: { en: 'Tamil', ta: 'தமிழ்' },

  // App
  app_name: { en: 'WorkForce Mesh', ta: 'வொர்க்ஃபோர்ஸ் மெஷ்' },
  app_tagline: { en: 'Connect businesses with flexible workers', ta: 'வணிகங்களை தொழிலாளர்களுடன் இணைக்க' },

  // Login / signup
  im_recruiter: { en: "I'm a Recruiter", ta: 'நான் ஒரு நிறுவனத்தார்' },
  im_worker: { en: "I'm Looking for Work", ta: 'எனக்கு வேலை வேண்டும்' },
  email: { en: 'Email', ta: 'மின்னஞ்சல்' },
  password: { en: 'Password', ta: 'கடவுச்சொல்' },
  sign_in: { en: 'Sign In', ta: 'உள்நுழை' },
  sign_up: { en: 'Sign Up', ta: 'பதிவு செய்' },
  sign_out: { en: 'Sign Out', ta: 'வெளியேறு' },
  have_account: { en: 'Already have an account? Sign In', ta: 'கணக்கு உண்டா? உள்நுழை' },
  no_account: { en: "Don't have an account? Sign Up", ta: 'கணக்கு இல்லையா? பதிவு செய்' },
  full_name: { en: 'Full Name', ta: 'முழு பெயர்' },
  company_name: { en: 'Company Name', ta: 'நிறுவன பெயர்' },
  company_address: { en: 'Company Address', ta: 'நிறுவன முகவரி' },
  contact_number: { en: 'Contact Number', ta: 'தொடர்பு எண்' },
  phone: { en: 'Phone Number', ta: 'தொலைபேசி எண்' },
  fill_company_details: { en: 'Enter your company details', ta: 'உங்கள் நிறுவன விவரங்களை உள்ளிடவும்' },
  fill_worker_details: { en: 'Enter your details', ta: 'உங்கள் விவரங்களை உள்ளிடவும்' },
  select_role: { en: 'Select who you are', ta: 'நீங்கள் யார் என்பதைத் தேர்வு செய்யவும்' },
  help_tap_assistant: { en: 'Tap the assistant button for help anytime', ta: 'உதவி பெற உதவியாளர் பொத்தானை அழுத்தவும்' },

  // Nav
  dashboard: { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  post_job: { en: 'Post a Job', ta: 'வேலை வெளியிடு' },
  search_workers: { en: 'Search Workers', ta: 'தொழிலாளர்களைத் தேடு' },
  my_postings: { en: 'My Postings', ta: 'எனது வேலைகள்' },
  job_board: { en: 'Job Board', ta: 'வேலை பலகை' },
  my_profile: { en: 'My Profile', ta: 'எனது சுயவிவரம்' },
  notifications: { en: 'Notifications', ta: 'அறிவிப்புகள்' },
  my_applications: { en: 'My Applications', ta: 'எனது விண்ணப்பங்கள்' },

  // Dashboard - recruiter
  hello: { en: 'Hello', ta: 'வணக்கம்' },
  manage_shortages: { en: 'Manage your workforce shortages', ta: 'உங்கள் பணியாளர் பற்றாக்குறையை நிர்வகிக்கவும்' },
  open_jobs: { en: 'Open Jobs', ta: 'திறந்த வேலைகள்' },
  total_shortage: { en: 'Total Shortage', ta: 'மொத்த பற்றாக்குறை' },

  // Dashboard - worker
  find_work: { en: 'Find work near you', ta: 'உங்கள் அருகே வேலை கண்டுபிடி' },
  pending: { en: 'Pending', ta: 'நிலுவை' },
  hired: { en: 'Hired', ta: 'நியமிக்கப்பட்டது' },
  new_notifications: { en: 'new notifications', ta: 'புதிய அறிவிப்புகள்' },

  // Job form
  job_title: { en: 'Job Title', ta: 'வேலை தலைப்பு' },
  skill_required: { en: 'Skill Required', ta: 'தேவையான திறன்' },
  zone_location: { en: 'Zone / Location', ta: 'மண்டலம் / இடம்' },
  exact_location: { en: 'Exact Location', ta: 'சரியான இடம்' },
  shift_start: { en: 'Shift Start Time', ta: 'ஷிஃப்ட் தொடக்க நேரம்' },
  shift_end: { en: 'Shift End Time', ta: 'ஷிஃப்ட் முடிவு நேரம்' },
  shift_date: { en: 'Shift Date', ta: 'ஷிஃப்ட் தேதி' },
  shift_timing: { en: 'Shift Timing', ta: 'ஷிஃப்ட் நேரம்' },
  salary: { en: 'Salary', ta: 'சம்பளம்' },
  workers_needed: { en: 'Number of Workers Needed', ta: 'தேவையான தொழிலாளர்கள்' },
  submit: { en: 'Submit', ta: 'சமர்ப்பிக்க' },
  cancel: { en: 'Cancel', ta: 'ரத்து' },
  select_zone: { en: 'Select zone...', ta: 'மண்டலம் தேர்வு...' },

  // Worker search
  filter_by_skill: { en: 'Filter by Skill', ta: 'திறல் படி வடிகட்டு' },
  filter_by_zone: { en: 'Filter by Zone', ta: 'மண்டலம் படி வடிகட்டு' },
  all_skills: { en: 'All Skills', ta: 'அனைத்து திறவுகள்' },
  all_zones: { en: 'All Zones', ta: 'அனைத்து மண்டலங்கள்' },
  hire_all: { en: 'Hire All', ta: 'அனைவரையும் நியமி' },
  no_workers_found: { en: 'No workers available right now', ta: 'தற்போது தொழிலாளர்கள் இல்லை' },
  distance: { en: 'away', ta: 'தூரம்' },
  id_verified: { en: 'ID Verified', ta: 'ஐடி சரிபார்க்கப்பட்டது' },
  block: { en: 'Block', ta: 'தடு' },
  report: { en: 'Report', ta: 'புகார்' },

  // Postings
  workers_hired: { en: 'Hired', ta: 'நியமிக்கப்பட்டது' },
  applicants: { en: 'Applicants', ta: 'விண்ணப்பதாரர்கள்' },
  accept: { en: 'Accept', ta: 'ஏற்க' },
  accepting: { en: 'Accepting...', ta: 'ஏற்கிறது...' },
  no_applicants: { en: 'No applicants yet', ta: 'இன்னும் விண்ணப்பங்கள் இல்லை' },
  no_jobs_posted: { en: 'No jobs posted yet', ta: 'இன்னும் வேலைகள் இல்லை' },
  covered: { en: 'Covered', ta: 'முழுமையாக' },
  partial_shortage: { en: 'Partial Shortage', ta: 'பகுதி பற்றாக்குறை' },
  critical_shortage: { en: 'Critical Shortage', ta: 'முக்கிய பற்றாக்குறை' },
  workers_needed_short: { en: 'workers needed', ta: 'தொழிலாளர்கள் தேவை' },
  select_job_for_hire: { en: 'Select a job to hire for', ta: 'நியமிக்க வேலை தேர்வு செய்யவும்' },
  hire_all_confirm: { en: 'Hire all shown workers for this job?', ta: 'காட்டப்பட்ட அனைவரையும் இந்த வேலைக்கு நியமிக்கவா?' },
  confirm: { en: 'Confirm', ta: 'உறுதிப்படுத்து' },

  // Worker profile
  age: { en: 'Age', ta: 'வயது' },
  qualification: { en: 'Qualification', ta: 'தகுதி' },
  skill: { en: 'Skill', ta: 'திறல்' },
  zone: { en: 'Zone', ta: 'மண்டலம்' },
  upload_id: { en: 'Upload ID Proof', ta: 'ஐடி சான்று பதிவேற்று' },
  id_uploaded: { en: 'ID uploaded', ta: 'ஐடி பதிவேற்றப்பட்டது' },
  tap_upload: { en: 'Tap to upload photo', ta: 'புகைப்படம் பதிவேற்ற தட்டவும்' },
  free_to_work: { en: 'Free to Work Right Now', ta: 'இப்போது வேலை செய்ய தயார்' },
  turn_on_to_show: { en: 'Turn on to show in searches', ta: 'தேடலில் காட்ட இயக்கு' },
  save: { en: 'Save', ta: 'சேமி' },
  saving: { en: 'Saving...', ta: 'சேமிக்கிறது...' },
  speak: { en: 'Speak', ta: 'பேசு' },
  listen: { en: 'Listen', ta: 'கேள்' },
  stop: { en: 'Stop', ta: 'நிறுத்து' },
  badge_visible: { en: 'Badge visible to recruiters', ta: 'நிறுவனங்களுக்கு பேட்ஜ் தெரியும்' },
  ratings: { en: 'ratings', ta: 'மதிப்பீடுகள்' },
  select_skill: { en: 'Select skill...', ta: 'திறல் தேர்வு...' },

  // Applications
  applied: { en: 'Applied — waiting for the manager to accept', ta: 'விண்ணப்பிக்கப்பட்டது — மேலாளர் ஏற்க காத்திருக்கிறது' },
  working_id: { en: 'Working ID', ta: 'வேலை ஐடி' },
  arrived: { en: "I've Arrived", ta: 'நான் வந்துவிட்டேன்' },
  checked_in: { en: 'Checked In', ta: 'வருகை பதிவு' },
  apply: { en: 'Apply', ta: 'விண்ணப்பிக்கு' },
  applying: { en: 'Applying...', ta: 'விண்ணப்பிக்கிறது...' },
  applied_already: { en: 'Applied', ta: 'விண்ணப்பிக்கப்பட்டது' },
  no_applications: { en: 'No applications yet', ta: 'இன்னும் விண்ணப்பங்கள் இல்லை' },
  rejected: { en: 'Rejected', ta: 'நிராகரிக்கப்பட்டது' },
  expired: { en: 'Expired', ta: 'காலாவதியானது' },
  completed: { en: 'Completed', ta: 'முடிந்தது' },
  rated: { en: 'Rated', ta: 'மதிப்பிடப்பட்டது' },

  // Notifications
  no_notifications: { en: 'No notifications yet', ta: 'இன்னும் அறிவிப்புகள் இல்லை' },
  mark_read: { en: 'Mark as Read', ta: 'படித்ததாக குறி' },
  listen_to_notification: { en: 'Listen', ta: 'கேள்' },

  // Ratings
  rate_worker: { en: 'Rate this Worker', ta: 'இந்த தொழிலாளரை மதிப்பிடு' },
  submit_rating: { en: 'Submit Rating', ta: 'மதிப்பீடு சமர்ப்பிக்கு' },

  // Assistant
  assistant: { en: 'Assistant', ta: 'உதவியாளர்' },
  ask_question: { en: 'Type your question here...', ta: 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...' },
  send: { en: 'Send', ta: 'அனுப்பு' },
  assistant_greeting: { en: 'Hi! I am your WorkForce Mesh assistant. Ask me anything about using this app.', ta: 'வணக்கம்! நான் உங்கள் வொர்க்ஃபோர்ஸ் மெஷ் உதவியாளர். எதையும் கேளுங்கள்.' },
  assistant_error: { en: 'Sorry, something went wrong. Please try again.', ta: 'மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.' },

  // Hire popup
  you_are_hired: { en: 'You Are Hired!', ta: 'நீங்கள் நியமிக்கப்பட்டீர்கள்!' },
  listen_to_details: { en: 'Listen to Details', ta: 'விவரங்களைக் கேளுங்கள்' },
  do_you_want_repeat: { en: 'Do you want me to repeat?', ta: 'நான் மீண்டும் சொல்லவா?' },
  yes: { en: 'Yes', ta: 'ஆம்' },
  no: { en: 'No', ta: 'இல்லை' },
  tap_anywhere: { en: 'Tap anywhere to listen', ta: 'கேட்க எங்கும் தட்டவும்' },

  // Voice
  listening: { en: 'Listening... speak now', ta: 'கேட்கிறது... இப்போது பேசுங்கள்' },
  voice_not_supported: { en: 'Voice input not supported on this device', ta: 'இந்த சாதனத்தில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை' },
  tts_not_supported: { en: 'Text-to-speech not supported on this device', ta: 'இந்த சாதனத்தில் உரை-குரல் ஆதரிக்கப்படவில்லை' },
  voice_help_on: { en: 'Voice help is on', ta: 'குரல் உதவி இயக்கத்தில்' },
  voice_help_off: { en: 'Voice help is off', ta: 'குரல் உதவி அணைக்கப்பட்டது' },
  voice_help_btn: { en: 'Voice Help', ta: 'குரல் உதவி' },
  say_yes: { en: 'Say Yes or No', ta: 'ஆம் அல்லது இல்லை என்று சொல்லுங்கள்' },

  // Misc
  loading: { en: 'Loading...', ta: 'ஏற்றுகிறது...' },
  error: { en: 'Something went wrong', ta: 'ஏதோ தவறு நடந்தது' },
  back: { en: 'Back', ta: 'பின்செல்' },
  close: { en: 'Close', ta: 'மூடு' },
  success: { en: 'Success', ta: 'வெற்றி' },
  hiring_success: { en: 'Worker hired successfully!', ta: 'தொழிலாளர் வெற்றிகரமாக நியமிக்கப்பட்டார்!' },
  hiring_all_success: { en: 'All workers hired successfully!', ta: 'அனைவரும் வெற்றிகரமாக நியமிக்கப்பட்டனர்!' },
  hiring_error: { en: 'Could not hire worker. Please try again.', ta: 'தொழிலாளரை நியமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' },
  post_job_first: { en: 'Post a job first, then use Hire All.', ta: 'முதலில் வேலை வெளியிடவும், பிறகு அனைவரையும் நியமிக்கவும்.' },
  no_matching_job: { en: 'No matching open job. Post a job first.', ta: 'பொருத்தமான வேலை இல்லை. முதலில் வேலை வெளியிடவும்.' },
  worker_reported: { en: 'Worker reported. They will not appear in your searches.', ta: 'தொழிலாளர் புகார் செய்யப்பட்டது. அவர்கள் உங்கள் தேடலில் தோன்றமாட்டார்கள்.' },
  upload_failed: { en: 'Upload failed', ta: 'பதிவேற்றம் தோல்வி' },
  job_posted: { en: 'Job posted successfully!', ta: 'வேலை வெற்றிகரமாக வெளியிடப்பட்டது!' },
  profile_saved: { en: 'Profile saved!', ta: 'சுயவிவரம் சேமிக்கப்பட்டது!' },
  applied_success: { en: 'Applied successfully!', ta: 'வெற்றிகரமாக விண்ணப்பிக்கப்பட்டது!' },
  no_open_jobs: { en: 'No open jobs right now', ta: 'தற்போது வேலைகள் இல்லை' },
  complete_profile_first: { en: 'Please complete your profile first', ta: 'முதலில் உங்கள் சுயவிவரத்தை முடிக்கவும்' },
};

export function t(key: string, lang: Lang): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] || entry.en;
}
