const firstAidData = {
  en: [
    {
      id: "cpr",
      title: "CPR (Adults)",
      icon: "🫀",
      steps: [
        { text: "Check responsiveness and breathing.", img: "images/cpstep1.png" },
        { text: "Call emergency services.", img: "images/cpstep2.png" },
        { text: "Start chest compressions: center of chest, 5–6 cm deep, 100–120/min.", img: "images/cpstep3.png" },
        { text: "Use AED as soon as available.", img: "images/cpstep4.png" },
        { text: "Continue cycles until help arrives.", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "hypothermia",
      title: "Hypothermia / Cold Shock",
      icon: "🥶",
      steps: [
        { text: "Move the person to a warm, dry place.", img: "images/A.png" },
        { text: "Help the patient lie down.", img: "images/B.png" },
        { text: "Remove wet clothing and place the person in a blanket.", img: "images/C.png" },
        { text: "Cover the head to retain body heat.", img: "images/D.png" },
        { text: "Give the patient warm drinks and use hot water bottles or heat packs.", img: "images/E.png" }
      ]
    },
    {
      id: "bleeding-wound",
      title: "Bleeding & Wound Care",
      icon: "🩹",
      steps: [
        { text: "Wear gloves if available.", img: "images/step1.avif" },
        { text: "Apply direct pressure with clean cloth or bandage.", img: "images/step2.png" },
        { text: "Elevate limb if no fracture suspected.", img: "images/step3.jpeg" },
        { text: "If bleeding soaks through, add more layers.", img: "images/step4.jpg" },
        { text: "Clean around wound and cover with sterile dressing.", img: "images/step5.jpeg" },
        { text: "Seek medical care if severe.", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "fractures",
      title: "Fractures",
      icon: "🦴",
      steps: [
        { text: "Immobilize the injured area.", img: "images/i.jpg" },
        { text: "Apply a splint if trained.", img: "images/ii.jpg" },
        { text: "Apply cold pack to reduce swelling.", img: "images/iii.webp" },
        { text: "Control any bleeding.", img: "images/iv.png" },
        { text: "Seek medical attention promptly.", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "sprains",
      title: "Sprains",
      icon: "🦵",
      steps: [
        { text: "Follow R.I.C.E: Rest, Ice, Compression, Elevation.", img: "images/1.png" },
        { text: "Rest the joint and avoid weight-bearing.", img: "images/2.png" },
        { text: "Ice 15–20 mins every 2–3 hours.", img: "images/3.png" },
        { text: "Apply elastic compression bandage.", img: "images/4.png" },
        { text: "Elevate above heart level.", img: "images/5.png" },
        { text: "Seek care if severe pain or deformity.", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "near-drowning",
      title: "Near Drowning",
      icon: "🌊",
      steps: [
        { text: "Ensure scene safety. Avoid becoming a victim.", img: "images/drown1.png" },
        { text: "Call emergency services immediately.", img: "images/drown2.png" },
        { text: "Check breathing and pulse.", img: "images/drown3.png" },
        { text: "If not breathing, start rescue breathing.", img: "images/drown4.png" },
        { text: "If no pulse, begin CPR.", img: "images/drown5.png" },
        { text: "Keep warm and monitor until help arrives.", img: "images/drown6.png" }
      ]
    },
    {
      id: "shock",
      title: "Shock",
      icon: "⚡",
      steps: [
        { text: "Lay person on back; elevate legs if no spine injury.", img: "images/shock1.png" },
        { text: "Keep warm and calm.", img: "images/shock2.png" },
        { text: "Control any bleeding.", img: "images/shock3.png" },
        { text: "Do not give food or drink if vomiting or unconscious.", img: "images/shock4.png" },
        { text: "Call emergency services.", img: "images/shock5.png" }
      ]
    },
    {
      id: "electrical-shock",
      title: "Electrical Shock",
      icon: "⚡️",
      steps: [
        { text: "Do not touch victim until power is off.", img: "images/elec1.png" },
        { text: "Turn off source or use non-conductive object to separate.", img: "images/elec2.png" },
        { text: "Call emergency services.", img: "images/elec3.png" },
        { text: "Check breathing and pulse.", img: "images/elec4.png" },
        { text: "Treat burns with cool water; do not apply creams.", img: "images/elec5.png" }
      ]
    }
  ],

  ne: [
    {
      id: "cpr",
      title: "सीपीआर (वयस्क)",
      icon: "🫀",
      steps: [
        { text: "उत्तर दिन्छ कि र श्वास छ कि जाँच्नुहोस्।", img: "images/cpstep1.png" },
        { text: "आपतकालीन सेवामा फोन गर्नुहोस्।", img: "images/cpstep2.png" },
        { text: "छातीको बीचमा ५–६ सेमी गहिरो थिचाइ सुरु गर्नुहोस्, प्रति मिनेट १००–१२०।", img: "images/cpstep3.png" },
        { text: "AED आयो भने प्रयोग गर्नुहोस्।", img: "images/cpstep4.png" },
        { text: "सहयोग आउँदासम्म दोहोर्याउनुहोस्।", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "hypothermia",
      title: "हाइपोथर्मिया / चिसो झड्का",
      icon: "🥶",
      steps: [
        { text: "व्यक्तिलाई न्यानो, सुख्खा ठाउँमा लैजानुहोस्।", img: "images/A.png" },
        { text: "रोगीलाई सुत्न मद्दत गर्नुहोस्।", img: "images/B.png" },
        { text: "भिजेको लुगा फेर्नुहोस् र व्यक्तिलाई कम्बलमा राख्नुहोस्।", img: "images/C.png" },
        { text: "शरीरको ताप राख्न टाउको ढाक्नुहोस्।", img: "images/D.png" },
        { text: "रोगीलाई न्यानो पेय दिनुहोस् र हट वाटर बोतल वा हीट प्याक प्रयोग गर्नुहोस्।", img: "images/E.png" }
      ]
    },
    {
      id: "bleeding-wound",
      title: "रक्तस्राव नियन्त्रण र घाउ हेरचाह",
      icon: "🩹",
      steps: [
        { text: "सम्भव भए पञ्जा लगाउनुहोस्।", img: "images/step1.avif" },
        { text: "सफा कपडा/ब्यान्डेजले दबाब दिनुहोस्।", img: "images/step2.png" },
        { text: "हड्डी भाँचिएको शंका नभए अंग उठाउनुहोस्।", img: "images/step3.jpeg" },
        { text: "भिज्यो भने थप तह थप्नुहोस्।", img: "images/step4.jpg" },
        { text: "सफा पानीले वरिपरि सफा गर्नुहोस् र स्टेराइल ड्रेसिङ लगाउनुहोस्।", img: "images/step5.jpeg" },
        { text: "गम्भीर भए उपचार खोज्नुहोस्।", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "fractures",
      title: "हड्डी भाँचिनु",
      icon: "🦴",
      steps: [
        { text: "घाइते भाग नचलाउनुहोस्।", img: "images/i.jpg" },
        { text: "सीप भए स्प्लिन्ट लगाउनुहोस्।", img: "images/ii.jpg" },
        { text: "कपडाले बेरिएको चिसो सेक दिनुहोस्।", img: "images/iii.webp" },
        { text: "रक्तस्राव नियन्त्रण गर्नुहोस्।", img: "images/iv.png" },
        { text: "छिटो चिकित्सा सेवा लिनुहोस्।", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "sprains",
      title: "मांसपेशी捻िनु",
      icon: "🦵",
      steps: [
        { text: "R.I.C.E: विश्राम, बरफ, कम्प्रेसन, उचाल्नु।", img: "images/1.png" },
        { text: "जोइन्टलाई विश्राम दिनुहोस्; बोझ नदिनुहोस्।", img: "images/2.png" },
        { text: "पहिलो २४–४८ घण्टा: हरेक २–३ घण्टा १५–२० मिनेट बरफ।", img: "images/3.png" },
        { text: "इलास्टिक ब्यान्डेजले कम्प्रेसन (अति कसेर होइन)।", img: "images/4.png" },
        { text: "हृदयभन्दा माथि उचालेर राख्नुहोस्।", img: "images/5.png" },
        { text: "गम्भीर दुखाइ वा जोइन्ट बिग्रिए उपचार लिनुहोस्।", img: "images/cpstep5.png" }
      ]
    },
    {
      id: "near-drowning",
      title: "झिलमा डुब्न लागेको",
      icon: "🌊",
      steps: [
        { text: "स्थान सुरक्षित छ कि जाँच गर्नुहोस्। आफैं जोखिममा नपर्नुहोस्।", img: "images/drown1.png" },
        { text: "तुरुन्तै आपतकालीन सेवामा फोन गर्नुहोस्।", img: "images/drown2.png" },
        { text: "श्वास र नाडी जाँच्नुहोस्।", img: "images/drown3.png" },
        { text: "श्वास छैन भने बचाउने सास दिनुहोस्।", img: "images/drown4.png" },
        { text: "नाडी छैन भने सीपीआर सुरु गर्नुहोस्।", img: "images/drown5.png" },
        { text: "न्यानो राख्नुहोस् र सहयोग आउँदम्म निगरानी गर्नुहोस्।", img: "images/drown6.png" }
      ]
    },
    {
      id: "shock",
      title: "शक (Shock)",
      icon: "⚡",
      steps: [
        { text: "ढाड सीधा राखेर लडाउनुहोस्; खुट्टा अलि उठाउनुहोस्।", img: "images/shock1.png" },
        { text: "न्यानो राख्नुहोस् र ढिला कपडा फुकाल्नुहोस्।", img: "images/shock2.png" },
        { text: "रक्तस्राव भए नियन्त्रण गर्नुहोस्।", img: "images/shock3.png" },
        { text: "बान्ता/बेहोस भए खाना-पानी नदिनुहोस्।", img: "images/shock4.png" },
        { text: "आपतकालीन सेवामा फोन गर्नुहोस्।", img: "images/shock5.png" }
      ]
    },
    {
      id: "electrical-shock",
      title: "बिद्युत् झटका",
      icon: "⚡️",
      steps: [
        { text: "विद्युत् बन्द नगरी पीडित छोइनुहोस्।", img: "images/elec1.png" },
        { text: "स्रोत बन्द गर्नुहोस् वा न-बिद्युत् वस्तुले टाढा पार्नुहोस्।", img: "images/elec2.png" },
        { text: "आपतकालीन सेवामा फोन गर्नुहोस्।", img: "images/elec3.png" },
        { text: "श्वास/नाडी जाँच्नुहोस्।", img: "images/elec4.png" },
        { text: "जलन भएको ठाउँ चिसो बहता पानीले चिस्याउनुहोस्।", img: "images/elec5.png" }
      ]
    }
  ]
};