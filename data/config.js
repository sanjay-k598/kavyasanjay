window.WEDDING_CONFIG = {
  brideName: "Kavya",
  groomName: "Sanjay",
  weddingDateDisplay: "Thursday 2 July, 2026",
  invitationImage: "assets/wedding/invitation.jpeg",
  couplePhoto: "assets/wedding/photo1.jpg",
  invitationCard: "assets/wedding/invitation.jpeg",
  weddingDate: "2026-07-02",
  muhurthamTime: "10:00",
  rsvpDeadline: "2026-06-20",
  /**
   * Google Form RSVP — create at https://forms.google.com (your Gmail).
   * Paste embed URL from Send → embed (must include ?embedded=true).
   * Responses → Link to Sheets stores rows in your Google account.
   */
  googleFormEmbedUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLScS6FR1id3ilLCJCSIA1_5G8HbE-pm_nY7JSj67JPQ9idWajA/viewform?embedded=true",
  googleFormViewUrl: "https://forms.gle/ABXme3F6Bnvsk6Cu7",
  languageOptions: ["en", "te", "kn"],
  whatsappNumber: "919999999999",
  emergencyNumber: "+91 90000 90000",
  /** YouTube background music: https://www.youtube.com/watch?v=lBVRsXXDJA0 */
  youtubeMusicId: "lBVRsXXDJA0",
  musicUrl: "",
  musicLoop: true,
  musicVolume: 60,
  musicAutoplay: true,
  /** Drive template with names — assets/video/intro-custom-web.mp4 */
  introVideoUrl: "assets/video/intro-custom-web.mp4",
  introVideoMode: "template",
  introVideoEnabled: true,
  introVideoLoop: false,
  introVideoChromaKey: false,
  venue: {
    name: "Bharatiya Temple",
    hall: "Old Prayer Hall",
    address: "6850 N Adams Rd, Troy, MI 48098",
    parking: "On-site parking at the temple.",
    googleMapsLink:
      "https://www.google.com/maps/search/?api=1&query=Bharatiya+Temple+Old+Prayer+Hall+6850+N+Adams+Rd+Troy+MI+48098",
    embedMap:
      "https://www.google.com/maps?q=Bharatiya+Temple+6850+N+Adams+Rd+Troy+MI+48098&output=embed"
  },
  residence: {
    name: "Residence",
    address: "29581 Greening St, Farmington Hills, MI 48334",
    googleMapsLink:
      "https://www.google.com/maps/search/?api=1&query=29581+Greening+St+Farmington+Hills+MI+48334",
    embedMap:
      "https://www.google.com/maps?q=29581+Greening+St+Farmington+Hills+MI+48334&output=embed"
  },
  events: [
    {
      name: "Engagement Ceremony",
      datetime: "2026-06-29T11:00:00-04:00",
      atResidence: true
    },
    {
      name: "Mehendi Evening",
      datetime: "2026-06-30T19:00:00-04:00",
      atResidence: true
    },
    {
      name: "Haldi",
      datetime: "2026-07-01T10:00:00-04:00",
      atResidence: true
    },
    {
      name: "Wedding Day",
      muhurtham: "Muhurtham 10 AM EST",
      datetime: "2026-07-02T09:00:00-04:00",
      location: "Bharatiya Temple, Old Prayer Hall, Troy (9:00 AM – 2:00 PM)"
    },
    {
      name: "Satyanarayana Vratham",
      datetime: "2026-07-03T11:00:00-04:00",
      atResidence: true
    }
  ],
  arrival: {
    title: "Arrival",
    text: "Fly into Detroit Metropolitan Wayne County Airport (DTW) — the nearest major airport for Troy & Farmington Hills.",
    link: "https://www.metroairport.com/"
  },
  hotelBooking: {
    note: "Search and book hotels in the Troy & Farmington Hills area.",
    bookUrl: "https://www.google.com/travel/hotels/Troy%2C%20Michigan%2C%20United%20States"
  },
  contact: [
    { title: "Sanjay", phone: "313-423-5855" },
    { title: "Kavya", phone: "313-652-2634" },
    { title: "Akshay", phone: "248-896-8111" }
  ],
  i18n: {
    en: {
      viewEvents: "Events",
      rsvpNow: "RSVP",
      eventsKicker: "Celebrations",
      events: "EVENTS",
      venueKicker: "Location",
      venue: "Wedding Venue",
      residence: "Residence",
      mapLink: "Map",
      directions: "Directions",
      playMusic: "Play music",
      pauseMusic: "Pause music",
      rsvpKicker: "Join Us",
      rsvp: "RSVP",
      fullName: "Full Name",
      guestCount: "Guest Count",
      submitRsvp: "Submit RSVP",
      openRsvpForm: "Open RSVP in new tab",
      rsvpFormNote: "Submit below — your response is saved to our guest list.",
      travelKicker: "For Guests",
      travelStay: "Travel & Stay",
      bookNow: "Book Now",
      dtwInfo: "DTW Airport Info",
      nearbyHotels: "Nearby Hotels",
      hotelsNote: "Search and book hotels in the Troy & Farmington Hills area.",
      bookHotels: "Book Hotels",
      contactKicker: "Help",
      contactHelp: "Contact"
    },
    te: {
      viewEvents: "కార్యక్రమాలు",
      rsvpNow: "RSVP",
      eventsKicker: "వేడుకలు",
      events: "వివాహ కార్యక్రమాలు",
      venueKicker: "స్థలం",
      venue: "వివాహ వేదిక",
      rsvpKicker: "మాతో చేరండి",
      rsvp: "RSVP",
      fullName: "పూర్తి పేరు",
      guestCount: "అతిథుల సంఖ్య",
      submitRsvp: "RSVP పంపండి",
      openRsvpForm: "కొత్త ట్యాబ్‌లో RSVP",
      rsvpFormNote: "క్రింద సమర్పించండి — మీ స్పందన మా అతిథి జాబితాలో సేవ్ అవుతుంది.",
      travelKicker: "అతిథులకు",
      travelStay: "ప్రయాణం & వసతి",
      bookNow: "బుక్ చేయండి",
      dtwInfo: "DTW విమానాశ్రయం",
      nearbyHotels: "సమీప హోటళ్లు",
      hotelsNote: "Troy & Farmington Hills ప్రాంతంలో హోటళ్లు బుక్ చేయండి.",
      bookHotels: "హోటళ్లు బుక్ చేయండి",
      contactKicker: "సహాయం",
      contactHelp: "సంప్రదింపు"
    },
    kn: {
      viewEvents: "ಕಾರ್ಯಕ್ರಮಗಳು",
      rsvpNow: "RSVP",
      eventsKicker: "ಆಚರಣೆಗಳು",
      events: "ಮದುವೆ ಕಾರ್ಯಕ್ರಮಗಳು",
      venueKicker: "ಸ್ಥಳ",
      venue: "ಮದುವೆ ವೇದಿಕೆ",
      rsvpKicker: "ನಮ್ಮೊಂದಿಗೆ",
      rsvp: "RSVP",
      fullName: "ಪೂರ್ಣ ಹೆಸರು",
      guestCount: "ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ",
      submitRsvp: "RSVP ಕಳುಹಿಸಿ",
      openRsvpForm: "ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ RSVP",
      rsvpFormNote: "ಕೆಳಗೆ ಸಲ್ಲಿಸಿ — ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ ನಮ್ಮ ಅತಿಥಿ ಪಟ್ಟಿಯಲ್ಲಿ ಉಳಿಯುತ್ತದೆ.",
      travelKicker: "ಅತಿಥಿಗಳಿಗೆ",
      travelStay: "ಪ್ರಯಾಣ & ವಸತಿ",
      bookNow: "ಬುಕ್ ಮಾಡಿ",
      dtwInfo: "DTW ವಿಮಾನ ನಿಲ್ದಾಣ",
      nearbyHotels: "ಹತ್ತಿರದ ಹೋಟೆಲ್‌ಗಳು",
      hotelsNote: "Troy & Farmington Hills ಪ್ರದೇಶದಲ್ಲಿ ಹೋಟೆಲ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ.",
      bookHotels: "ಹೋಟೆಲ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ",
      contactKicker: "ಸಹಾಯ",
      contactHelp: "ಸಂಪರ್ಕ"
    }
  }
};
