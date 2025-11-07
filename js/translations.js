const TRANSLATIONS = {
  en: {
    langToggleTo: 'नेपाली',
    guideBtn: '🩺 Guide',
    gameBtn: '🎮 Game',
    helplineBtn: '📞 Helpline',
    searchPlaceholder: 'Search places...',
    placeNotFound: 'Place not found',
    policeLabel: 'Police',
    ambulanceLabel: 'Ambulance',
    fireLabel: 'Fire Brigade',
    womenLabel: 'Women Helpline',
    childLabel: 'Child Helpline',
    geoUnsupported: 'Geolocation not supported',
    geoDenied: 'Unable to access location. Please allow location permissions.',

    gameTitle: 'GAME',
    backBtn: '⬅ Back',
    nextBtn: 'Next ▶',
    restartBtn: 'Restart',
    scoreLabel: 'Score',
    questionLabel: 'Question',
    roundComplete: (score) => `Round complete! Your score: ${score}/10`,

    gameQuestions: [
      // Flood & Mosquito
      { q: 'Which practice helps prevent mosquito-borne diseases after floods?', opts: ['Store water uncovered', 'Use mosquito nets at night', 'Keep garbage piled up', 'Ignore stagnant water'], correct: 1 },
      { q: 'To reduce dengue risk, you should:', opts: ['Keep flower pots filled with water', 'Change water in containers every 2–3 days', 'Store tyres outside to collect rainwater', 'Avoid cleaning coolers'], correct: 1 },
      { q: 'Eliminate mosquito breeding by:', opts: ['Removing stagnant water around homes', 'Storing water in open buckets', 'Keeping gutters clogged', 'Leaving containers outdoors'], correct: 0 },
      { q: 'Personal protection against mosquitoes includes:', opts: ['Wear long sleeves and use repellent', 'Sleep outdoors without cover', 'Keep windows open without screens', 'Avoid cleaning rooms'], correct: 0 },

      // Water Safety
      { q: 'Safe drinking water after a flood is best ensured by:', opts: ['Boiling water for 1–3 minutes', 'Adding mud to settle dirt', 'Drinking directly from flood channels', 'Using rusty containers'], correct: 0 },
      { q: 'Household water disinfection (if boiling is not possible) can use:', opts: ['A few drops of chlorine/bleach (per guidance)', 'Sugar', 'Kerosene', 'Salt only'], correct: 0 },
      { q: 'Correct water filtration practice includes:', opts: ['Using clean cloth or commercial filters', 'Using dirty cloth', 'Skipping filtration', 'Drinking from open ponds'], correct: 0 },
      { q: 'Solar disinfection (SODIS) works by:', opts: ['Placing water in clear bottles under sunlight for 6 hours', 'Boiling for 10 seconds', 'Adding salt', 'Covering bottles and keeping in shade'], correct: 0 },

      // Dos & Don’ts
      { q: 'Which is a DO during floods?', opts: ['Walk in moving flood water', 'Keep emergency kit and clean water ready', 'Touch downed power lines', 'Drink from unknown sources'], correct: 1 },
      { q: 'Which is a DON’T during floods?', opts: ['Cover food properly', 'Use latrines/toilets', 'Use contaminated water to prepare food', 'Wash hands with soap'], correct: 2 },
      { q: 'To prevent diarrhea/cholera after floods, you should:', opts: ['Skip handwashing', 'Wash hands with soap before eating and after toilet', 'Eat uncovered roadside food', 'Use unclean utensils'], correct: 1 },
      { q: 'Food safety post-flood includes:', opts: ['Eat food that smells odd', 'Reheat leftovers thoroughly', 'Ignore expiry dates', 'Use swollen cans'], correct: 1 },

      // Leptospirosis & waterborne diseases
      { q: 'To prevent leptospirosis (water-borne), avoid:', opts: ['Wading in flood water with cuts on feet', 'Covering wounds', 'Wearing boots in water', 'Seeking medical care if fever'], correct: 0 },
      { q: 'Safe storage of water includes:', opts: ['Covered, clean containers with taps', 'Open tubs without lids', 'Mixing drinking and washing water', 'Using chemical containers'], correct: 0 },
      { q: 'Drink only water that is:', opts: ['Boiled, filtered, or treated', 'Taken directly from rivers', 'Left uncovered overnight', 'From puddles'], correct: 0 },

      // Scenarios
      { q: 'You find a child in flood water showing fever and vomiting. What to do?', opts: ['Ignore and move on', 'Give untreated water', 'Seek medical attention immediately', 'Only give food'], correct: 2 },
      { q: 'After flood, you notice muddy water at home. You should:', opts: ['Boil or filter before use', 'Use it directly for drinking', 'Leave it standing without cleaning', 'Pour it on plants'], correct: 0 },
      { q: 'If electricity is down during floods, what should you do for lighting?', opts: ['Use candles carefully', 'Touch wet wires', 'Use lamps without care', 'Ignore safety'], correct: 0 },
      { q: 'You see stagnant water near your house. Best action:', opts: ['Drain it or cover', 'Ignore it', 'Use it for washing dishes', 'Throw trash in it'], correct: 0 },
      { q: 'Food left unrefrigerated after flood can cause:', opts: ['Food poisoning', 'Better taste', 'No effect', 'Nothing'], correct: 0 },

      // Additional water filtration questions
      { q: 'Boiling water kills:', opts: ['Bacteria and viruses', 'Only dirt', 'Salt', 'Mosquitoes'], correct: 0 },
      { q: 'Chlorine/bleach should be used:', opts: ['According to instructions', 'Any amount', 'Too much for faster effect', 'Never'], correct: 0 },
      { q: 'Iodine tablets work best when:', opts: ['Left 30 minutes before drinking', 'Added and drunk immediately', 'Mixed with sugar', 'Frozen'], correct: 0 },
      { q: 'Filtering water removes:', opts: ['Particles and dirt', 'Viruses completely', 'Chlorine', 'Sugar'], correct: 0 },
      { q: 'SODIS is effective in:', opts: ['Clear PET bottles in sunlight', 'Metal cans in shade', 'Opaque bottles', 'Dark containers'], correct: 0 },

      // Random practical questions
      { q: 'During floods, wear:', opts: ['Boots and gloves', 'Flip flops', 'No protection', 'Sandals only'], correct: 0 },
      { q: 'Emergency kit should include:', opts: ['First aid, clean water, flashlight', 'Only clothes', 'Snacks only', 'Nothing'], correct: 0 },
      { q: 'If someone has diarrhea after flood, you should:', opts: ['Provide oral rehydration solution', 'Give untreated water', 'Ignore symptoms', 'Use antibiotics without advice'], correct: 0 },
      { q: 'Keep drinking water in:', opts: ['Covered, clean containers', 'Open buckets', 'Mix with dirty water', 'Containers used for chemicals'], correct: 0 },
      { q: 'Boiled water should cool before drinking to:', opts: ['Avoid burns', 'Cool taste', 'None', 'Add flavor'], correct: 0 }
    ]
  },
  np: {
    langToggleTo: 'English',
    guideBtn: '🩺 मार्गदर्शन',
    gameBtn: '🎮 खेल',
    helplineBtn: '📞 हेल्पलाइन',
    searchPlaceholder: 'स्थान खोज्नुहोस्...',
    placeNotFound: 'स्थान फेला परेन',
    policeLabel: 'प्रहरी',
    ambulanceLabel: 'एम्बुलेन्स',
    fireLabel: 'अग्नि नियन्त्रक',
    womenLabel: 'महिला हेल्पलाइन',
    childLabel: 'बालबालिका हेल्पलाइन',
    geoUnsupported: 'भौगोलिक स्थान समर्थन हुँदैन',
    geoDenied: 'स्थान पहुँच असफल। कृपया स्थान अनुमति दिनुहोस्।',

    gameTitle: 'खेल',
    backBtn: '⬅ फर्कनुहोस्',
    nextBtn: 'अर्को ▶',
    restartBtn: 'पुन: सुरु',
    scoreLabel: 'अंक',
    questionLabel: 'प्रश्न',
    roundComplete: (score) => `राउन्ड समाप्त! तपाईंको अंक: ${score}/10`,

    gameQuestions: [
      { q: 'बाढीपछि झिँगाजस्ता कीराबाट हुने रोग रोक्न के उपयोगी छ?', opts: ['खुला ढाक्ना पानी भण्डारण', 'राति झुल (नेट) प्रयोग', 'डुंगुर फोहोर थुपारेर राख्ने', 'भएका पानी जमाइहरू बेवास्ता गर्ने'], correct: 1 },
      { q: 'डेङ्गुको जोखिम घटाउन तपाईंले के गर्नु पर्छ?', opts: ['भाँडामा पानी भरेर राखिराख्ने', '२–३ दिनमा भाँडाको पानी फेर्ने', 'टायर बाहिर वर्षातको पानी सङ्कलन गर्न राख्ने', 'कुलरहरू सफा नगर्ने'], correct: 1 },
      { q: 'झिँगाको आत्मजनन रोक्न के गर्ने?', opts: ['घर वरिपरि जमेको पानी हटाउने', 'बाकेमा खुला पानी राख्ने', 'नालीहरू जाम राख्ने', 'भाँडाकुँडा बाहिरै खुला छाड्ने'], correct: 0 },
      { q: 'झिँगाबाट जोगिन व्यक्तिगत सुरक्षा के हो?', opts: ['लामो हाताको लुगा र रिपेलन्ट', 'बाहिर खुला सुत्ने', 'झ्यालमा जाली नराख्ने', 'कोठा नफर्कने/नसफा गर्ने'], correct: 0 },

      { q: 'बाढीपछि सुरक्षित पिउने पानी कसरी सुनिश्चित गर्ने?', opts: ['पानी १–३ मिनेट उमाल्ने', 'माटो थपेर फोहोर बसाल्ने', 'बाढी नालाबाट पिउने', 'जंग लागेका भाँडो प्रयोग गर्ने'], correct: 0 },
      { q: 'उमाल्न नसके घरायसी पानी शुद्धिकरण कसरी?', opts: ['निर्देशनअनुसार क्लोरिन/ब्लीचका थोपा', 'चिनी', 'मट्टीतेल', 'नुन मात्र'], correct: 0 },
      { q: 'सफा फिल्ट्रेशन अभ्यासमा के हुन्छ?', opts: ['सफा कपडा वा कमर्शियल फिल्टर प्रयोग', 'फोहर कपडा प्रयोग', 'फिल्टर नगर्ने', 'खुला पोखरीबाट पिउने'], correct: 0 },
      { q: 'SODIS प्रभावकारी हुन्छ:', opts: ['सुर्यको प्रकाशमा पारदर्शी PET बोटलमा राख्ने', 'धातुका कन्टेनरमा छायाँमा राख्ने', 'अपारदर्शी बोटल', 'अन्धकार कन्टेनर'], correct: 0 },

      { q: 'बाढीको बेला कुन काम DO हो?', opts: ['बहिरहेको पानीमा हिँड्ने', 'आपतकालीन किट र सफा पानी तयार राख्ने', 'खसेका विद्युत् तार छोइदिने', 'अज्ञात स्रोतको पानी पिउने'], correct: 1 },
      { q: 'बाढीको बेला कुन काम DON’T हो?', opts: ['खाना राम्रोसँग ढाक्ने', 'शौचालय प्रयोग गर्ने', 'फोहोर पानीले खाना बनाउने', 'साबुनले हात धुने'], correct: 2 },
      { q: 'दस्त/विविसूची रोकथामका लागि के गर्नु पर्छ?', opts: ['हात नधुने', 'खाना खानुअघि र शौचालयपछि साबुनले हात धुने', 'ढाकिएको नभएको सडकछेउको खाना खाने', 'फोहर भाँडाकुँडा प्रयोग गर्ने'], correct: 1 },
      { q: 'बाढीपछि खाना सुरक्षित राख्न के गर्ने?', opts: ['गन्हाएको खाना खाने', 'बाँकी खाना राम्ररी तताउने', 'म्याद सकिएको बेवास्ता गर्ने', 'फुलेका क्यानहरू प्रयोग गर्ने'], correct: 1 },

      { q: 'लेप्टोस्पाइरोसिस रोक्न के नगर्ने?', opts: ['खुट्टामा घाउ हुँदा बाढीको पानीमा हिँड्ने', 'घाउ छोप्ने', 'बुट लगाएर पानीमा हिँड्ने', 'ज्वरो आए चिकित्सक देखाउने'], correct: 0 },
      { q: 'पानी सुरक्षित भण्डारण कसरी गर्ने?', opts: ['ढक्कन भएको सफा ट्यापवाला भाँडा', 'ढाकिएको नभएको टब', 'खाने र धुने पानी मिसाएर राख्ने', 'रसायन राखिएका भाँडामा राख्ने'], correct: 0 },
      { q: 'पिउने पानी कस्तो हुनु पर्छ?', opts: ['उमालिएको, फिल्टर गरिएको वा शुद्ध', 'नदीबाट सोझै लिने', 'राति राखिएको', 'पोखरीको पानी'], correct: 0 },

      { q: 'बाढीमा बच्चा ज्वरो र उल्टी देखाउँदा के गर्ने?', opts: ['बेवास्ता गर्ने', 'अशुद्ध पानी दिने', 'छिट्टै चिकित्सक देखाउने', 'खान मात्र दिने'], correct: 2 },
      { q: 'घरमा फोहोर पानी देख्दा के गर्ने?', opts: ['उमालेर वा फिल्टर गरेर प्रयोग', 'सिधै पिउने', 'फोहोर छोड्ने', 'बोटमा हाल्ने'], correct: 0 },
      { q: 'बिजुली नआएको बेला बत्तीका लागि के गर्ने?', opts: ['सावधानीपूर्वक मैनबत्ती प्रयोग', 'भिजेको तार छोइने', 'बिना ध्यान लैंप प्रयोग', 'सुरक्षा बेवास्ता'], correct: 0 },
      { q: 'घर वरिपरि जमेको पानी देख्दा के गर्ने?', opts: ['नाली/पानी निकास वा ढाक्ने', 'बेवास्ता गर्ने', 'भाँडामा धोएर प्रयोग गर्ने', 'फोहोर फाल्ने'], correct: 0 },
      { q: 'फोहोर नखानाले के हुन्छ?', opts: ['खाना विष', 'स्वाद राम्रो', 'कुनै असर हुँदैन', 'केही होइन'], correct: 0 },

      { q: 'बाढीमा के लगाउने?', opts: ['बुट्स र ग्लोभ्स', 'फ्लिप फ्लप', 'सुरक्षा नगर्ने', 'स्यान्डल मात्र'], correct: 0 },
      { q: 'आपतकालीन किटमा के राख्ने?', opts: ['पहिलो उपचार, सफा पानी, टर्च', 'मात्र लुगा', 'खाना मात्रै', 'केही छैन'], correct: 0 },
      { q: 'दस्त भएमा के गर्ने?', opts: ['ओरल रिहाइड्रेसन समाधान दिने', 'अशुद्ध पानी दिने', 'लक्षण बेवास्ता गर्ने', 'सल्लाह बिना एन्टिबायोटिक'], correct: 0 },
      { q: 'पिउने पानी राख्ने तरिका?', opts: ['ढाकिएको, सफा कन्टेनर', 'खुला बाल्टिन', 'फोहोर पानीसँग मिसाउने', 'रासायनिक कन्टेनर प्रयोग'], correct: 0 },
      { q: 'उमालिएको पानी किन चिसो भएपछि पिउने?', opts: ['पानीले पोल्न नदिने', 'स्वादको लागि', 'कुनै अर्थ छैन', 'फ्लेवर थप्न'], correct: 0 }
    ]
  }
};
