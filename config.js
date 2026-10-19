// Public runtime configuration. Edit this file after extracting the Netlify ZIP.
// Use the Supabase publishable/anon PUBLIC key. Never use a service_role or secret key.
window.PIT_CONFIG = {
  supabaseUrl: "https://izemieqxplyvtcsbdhet.supabase.co",
  supabaseAnonKey: "sb_publishable_kmnR4MXW4im1JFAiv0RXpQ_umFPaCwK",
  // Temporary local-only mode: set false to hide and disable.
  enableSoloTest: true,
  // Mobile reserves the Netlify floating badge footprint when the badge is external
  // to this document. Actual readable badge bounds replace that estimate.
  // Use "none" only when hosting without a floating badge.
  hudHostingBadge: "netlify"
};
