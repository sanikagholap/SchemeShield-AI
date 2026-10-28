"""
Multilingual Explainability Service for SchemeShield AI.
Generates comprehensive, localized explanations in English, Hindi, and Marathi
for overall verification results, individual risk checks, score calculations,
evidence limitations, and citizen guidance.

Guarantees strict invariant consistency:
- risk_score, confidence_score, and result_label are 100% identical across all three languages.
- Individual check weights, evidence items, and limitations remain strictly identical.
- Missing evidence is explained as uncertainty, never automatically as fraud.
- Clean scam checks are explicitly not treated as definitive proof of authenticity.
"""

from typing import Any, Dict, List, Optional

from app.utils.exceptions import AppException


class MultilingualExplanationService:
    """
    Centralized localization and explainability service providing
    citizen-friendly explanations in English, Hindi, and Marathi.
    """

    SUPPORTED_LANGUAGES = ("en", "hi", "mr")

    LABEL_TRANSLATIONS: Dict[str, Dict[str, str]] = {
        "genuine": {
            "en": "Official / Genuine Government Scheme",
            "hi": "प्रामाणिक / आधिकारिक सरकारी योजना",
            "mr": "अधिकृत / खरी शासकीय योजना",
        },
        "suspicious": {
            "en": "Suspicious / Potential Scam Scheme",
            "hi": "संदिग्ध / संभावित धोखाधड़ी योजना",
            "mr": "संशयास्पद / संभाव्य बनावट योजना",
        },
        "potentially_fake": {
            "en": "Potentially Fake / Unauthorized Scheme Claim",
            "hi": "संभावित रूप से नकली / अनधिकृत योजना दावा",
            "mr": "संभाव्य बनावट / अनधिकृत योजना दावा",
        },
        "duplicate": {
            "en": "Matches Existing Official Government Scheme",
            "hi": "मौजूदा आधिकारिक सरकारी योजना से मेल खाता है",
            "mr": "विद्यमान अधिकृत शासकीय योजनेशी जुळणारे",
        },
        "unable_to_verify": {
            "en": "Unable to Verify / Insufficient Public Evidence",
            "hi": "सत्यापित करने में असमर्थ / अपर्याप्त सार्वजनिक प्रमाण",
            "mr": "पडताळणी करणे शक्य नाही / अपुरा सार्वजनिक पुरावा",
        },
    }

    STATUS_MEANINGS: Dict[str, Dict[str, str]] = {
        "genuine": {
            "en": "This scheme matches official government records with verified ministerial provenance. It is recognized as an authentic public welfare initiative.",
            "hi": "यह योजना सत्यापित मंत्रालय स्रोतों के साथ आधिकारिक सरकारी रिकॉर्ड से मेल खाती है। इसे एक प्रामाणिक जन कल्याणकारी पहल के रूप में मान्यता प्राप्त है।",
            "mr": "ही योजना पडताळणी केलेल्या मंत्रालय स्रोतांसह अधिकृत शासकीय नोंदींशी सुसंगत आहे. यास खरी जन कल्याणकारी योजना म्हणून मान्यता आहे.",
        },
        "suspicious": {
            "en": "This announcement exhibits warning signs such as unverified external links, unrealistic promises, or high urgency. Proceed with extreme caution.",
            "hi": "इस घोषणा में गैर-सत्यापित बाहरी लिंक, अवास्तविक वादे या अत्यधिक जल्दबाजी जैसी चेतावनियां मिली हैं। अत्यधिक सावधानी बरतें।",
            "mr": "या घोषणेमध्ये अपडताळणीकृत बाह्य लिंक्स, अवास्तव आश्वासने किंवा अति तातडी दाखवणारे संशयास्पद घटक आढळले आहेत. अत्यंत सावधगिरी बाळगा.",
        },
        "potentially_fake": {
            "en": "Critical fraud indicators detected, such as requests for money, fees, passwords, or personal banking credentials. High likelihood of unauthorized scam.",
            "hi": "गंभीर धोखाधड़ी के संकेत मिले हैं, जैसे पैसे, शुल्क, पासवर्ड या बैंकिंग क्रेडेंशियल की मांग। अनधिकृत घोटाले की अत्यधिक संभावना है।",
            "mr": "पैसे, शुल्क, पासवर्ड किंवा बँक खात्याची माहिती मागण्यासारखे गंभीर फसवणुकीचे संकेत आढळले आहेत. अनधिकृत फसवणुकीची दाट शक्यता आहे.",
        },
        "duplicate": {
            "en": "This message appears to mirror or copy a genuine government program, but may be circulated through unofficial or third-party channels.",
            "hi": "यह संदेश किसी वास्तविक सरकारी कार्यक्रम की नकल करता प्रतीत होता है, लेकिन इसे अनधिकृत या तीसरे पक्ष के चैनलों के माध्यम से प्रसारित किया जा सकता है।",
            "mr": "हा संदेश खऱ्या शासकीय योजनेची नक्कल करणारा दिसतो, परंतु तो अनधिकृत किंवा त्रयस्थ माध्यमांतून प्रसारित केला जात असावा.",
        },
        "unable_to_verify": {
            "en": "There is insufficient public evidence or verifiable government records to determine authenticity. Absence of proof is not proof of fraud.",
            "hi": "प्रामाणिकता निर्धारित करने के लिए अपर्याप्त सार्वजनिक प्रमाण या सत्यापन योग्य सरकारी रिकॉर्ड उपलब्ध हैं। प्रमाण की कमी का अर्थ स्वतः धोखाधड़ी नहीं है।",
            "mr": "सत्यता ठरवण्यासाठी अपुरा सार्वजनिक पुरावा किंवा पडताळणीयोग्य सरकारी नोंदी उपलब्ध आहेत. पुराव्याचा अभाव म्हणजे थेट फसवणूक नव्हे.",
        },
    }

    CHECK_TITLES: Dict[str, Dict[str, str]] = {
        "official_source_check": {
            "en": "Official Government Portal Corroboration",
            "hi": "आधिकारिक सरकारी पोर्टल पुष्टि",
            "mr": "अधिकृत शासकीय संकेतस्थळ पडताळणी",
        },
        "linguistic_scam_pattern_check": {
            "en": "Fraud & Exploitative Language Scanning",
            "hi": "धोखाधड़ी एवं भ्रामक भाषा विश्लेषण",
            "mr": "फसवणूक व दिशाभूल करणारी भाषा तपासणी",
        },
        "catalogue_similarity_check": {
            "en": "Government Scheme Catalogue Matching",
            "hi": "सरकारी योजना सूची मिलान",
            "mr": "शासकीय योजना सूची जुळवणी",
        },
        "document_or_url_integrity_check": {
            "en": "Evidence Source & Transmission Integrity",
            "hi": "प्रमाण स्रोत एवं दस्तावेज़ सत्यता",
            "mr": "पुरावा स्रोत व दस्तऐवज सत्यता",
        },
    }

    CHECK_FINDINGS: Dict[str, Dict[str, Dict[str, str]]] = {
        "official_source_check": {
            "pass": {
                "en": "Link resolves to a verified government domain under the official .gov.in or .nic.in registry.",
                "hi": "प्रस्तुत लिंक आधिकारिक .gov.in या .nic.in रजिस्ट्री के तहत एक सत्यापित सरकारी डोमेन पर जाती है।",
                "mr": "सादर केलेली लिंक अधिकृत .gov.in किंवा .nic.in नोंदणी अंतर्गत पडताळलेल्या सरकारी डोमेनशी जोडलेली आहे.",
            },
            "warning": {
                "en": "Link points to an unverified private or commercial domain rather than an official government portal.",
                "hi": "लिंक किसी आधिकारिक सरकारी पोर्टल के बजाय एक असत्यापित निजी या वाणिज्यिक डोमेन पर जाती है।",
                "mr": "लिंक अधिकृत सरकारी पोर्टलऐवजी अपडताळणीकृत खाजगी किंवा व्यावसायिक डोमेनवर नेणारी आहे.",
            },
            "fail": {
                "en": "Link makes official ministerial claims but is hosted on an untrusted or suspicious third-party site.",
                "hi": "लिंक आधिकारिक मंत्रालय दावे करती है लेकिन एक अविश्वसनीय या संदिग्ध तीसरे पक्ष की वेबसाइट पर आधारित है।",
                "mr": "लिंक अधिकृत मंत्रालयाचे दावे करते परंतु ती अविश्वासार्ह किंवा संशयास्पद त्रयस्थ संकेतस्थळावर होस्ट केलेली आहे.",
            },
            "inconclusive": {
                "en": "No web link was provided for domain verification. This reflects missing evidence, not evidence of fraud.",
                "hi": "डोमेन सत्यापन के लिए कोई वेब लिंक नहीं दिया गया था। यह साक्ष्य की कमी को दर्शाता है, धोखाधड़ी का प्रमाण नहीं।",
                "mr": "डोमेन पडताळणीसाठी कोणतीही वेब लिंक दिली नव्हती. हे पुराव्याची कमतरता दर्शवते, फसवणुकीचा पुरावा नाही.",
            },
        },
        "linguistic_scam_pattern_check": {
            "pass": {
                "en": "No overt scam indicators, fee demands, or credential harvesting phrases were found. Note: A clean text check alone does not guarantee authenticity.",
                "hi": "कोई स्पष्ट धोखाधड़ी संकेत, शुल्क मांग या क्रेडेंशियल चोरी की शब्दावली नहीं मिली। ध्यान रहे: केवल स्वच्छ भाषा योजना की पूर्ण प्रामाणिकता सिद्ध नहीं करती।",
                "mr": "कोणतेही उघड फसवणूक संकेत, शुल्क मागणी किंवा माहिती चोरीचे शब्द आढळले नाहीत. लक्षात ठेवा: केवळ स्वच्छ मजकूर योजनेच्या पूर्ण अधिकृततेची हमी देत नाही.",
            },
            "warning": {
                "en": "Message contains elevated urgency or viral forwarding phrases commonly seen in unverified claims.",
                "hi": "संदेश में अत्यधिक जल्दबाजी या फॉरवर्डिंग शब्दावली पाई गई है, जो असत्यापित दावों में आम है।",
                "mr": "संदेशात अति तातडी किंवा व्हायरल फॉरवर्डिंग भाषा आढळली आहे, जी अपडताळणीकृत दाव्यांमध्ये सामान्य असते.",
            },
            "fail": {
                "en": "Critical red flags detected, such as requests for processing fees, banking details, or secret OTPs. Genuine government programs do not solicit fees this way.",
                "hi": "गंभीर चेतावनियां मिलीं, जैसे प्रोसेसिंग शुल्क, बैंक विवरण या ओटीपी की मांग। प्रामाणिक सरकारी योजनाएं इस प्रकार कभी पैसे नहीं मांगतीं।",
                "mr": "गंभीर धोक्याचे संकेत आढळले, जसे की प्रक्रिया शुल्क, बँक तपशील किंवा ओटीपीची मागणी. खरी शासकीय योजना अशा प्रकारे कधीही पैसे मागत नाही.",
            },
            "inconclusive": {
                "en": "Submitted text is too brief to evaluate linguistic scam patterns reliably.",
                "hi": "प्रस्तुत पाठ भाषाई धोखाधड़ी विश्लेषण के लिए अत्यंत संक्षिप्त है।",
                "mr": "सादर केलेला मजकूर भाषिक फसवणूक विश्लेषणासाठी अत्यंत अपुरा आहे.",
            },
        },
        "catalogue_similarity_check": {
            "pass": {
                "en": "Scheme closely matches an existing record in the official 2,000+ government catalogue.",
                "hi": "योजना आधिकारिक 2,000+ सरकारी योजना सूची में एक मौजूदा रिकॉर्ड से निकटता से मेल खाती है।",
                "mr": "योजना अधिकृत २,०००+ शासकीय योजना सूचीतील नोंदीशी तंतोतंत जुळते.",
            },
            "warning": {
                "en": "Scheme mirrors an official government program, but is being distributed through an unverified channel.",
                "hi": "योजना एक आधिकारिक सरकारी कार्यक्रम से मिलती-जुलती है, लेकिन इसे एक असत्यापित माध्यम से प्रचारित किया जा रहा है।",
                "mr": "योजना अधिकृत शासकीय कार्यक्रमासारखी दिसते, परंतु ती अपडताळणीकृत माध्यमातून प्रसारित केली जात आहे.",
            },
            "fail": {
                "en": "Scheme title conflicts with official naming conventions or misrepresents established ministerial scopes.",
                "hi": "योजना का नाम आधिकारिक नामकरण नियमों से मेल नहीं खाता या स्थापित मंत्रालय क्षेत्राधिकार को गलत तरीके से प्रस्तुत करता है।",
                "mr": "योजनेचे नाव अधिकृत नामकरण नियमांशी विसंगत आहे किंवा मंत्रालयीन अधिकारांचा विपर्यास करते.",
            },
            "inconclusive": {
                "en": "No matching record was found in the official scheme catalogue. The scheme may be new, regional, or unindexed, rather than automatically fake.",
                "hi": "आधिकारिक योजना सूची में कोई मिलान नहीं मिला। यह योजना नई, स्थानीय या गैर-सूचीबद्ध हो सकती है, इसे तुरंत फर्जी नहीं माना जा सकता।",
                "mr": "अधिकृत योजना सूचीमध्ये कोणतीही जुळणी आढळली नाही. ही योजना नवीन, प्रादेशिक किंवा अविकसित असू शकते, हा थेट फसवणुकीचा पुरावा नाही.",
            },
        },
        "document_or_url_integrity_check": {
            "pass": {
                "en": "Input channel and content structure are intact, readable, and verified.",
                "hi": "इनपुट माध्यम और सामग्री संरचना अक्षुण्ण, पठनीय और सत्यापित हैं।",
                "mr": "माहितीचे माध्यम आणि मजकुराची रचना सुव्यवस्थित, वाचनीय आणि पडताळलेली आहे.",
            },
            "warning": {
                "en": "Source input has minor readability limitations or formatting warnings.",
                "hi": "स्रोत इनपुट में आंशिक पठनीयता सीमाएं या प्रारूपण संबंधी चेतावनियां हैं।",
                "mr": "स्रोत माहितीमध्ये अंशतः वाचनीयतेच्या मर्यादा किंवा स्वरूपण सूचना आहेत.",
            },
            "fail": {
                "en": "Source input contains contradictory transmission attributes or failed security constraints.",
                "hi": "स्रोत इनपुट में विरोधाभासी विशेषताएं हैं या यह सुरक्षा जांच में विफल रहा है।",
                "mr": "स्रोत माहितीमध्ये विसंगत घटक आढळले आहेत किंवा ती सुरक्षा तपासणीत अपयशी ठरली आहे.",
            },
            "inconclusive": {
                "en": "Input data contains insufficient text or metadata for a complete transmission integrity check.",
                "hi": "पूर्ण अखंडता जांच के लिए इनपुट डेटा में पर्याप्त पाठ या मेटाडेटा उपलब्ध नहीं है।",
                "mr": "संपूर्ण सत्यता तपासणीसाठी इनपुट डेटामध्ये अपुरा मजकूर किंवा मेटाडेटा आहे.",
            },
        },
    }

    CHECK_ACTIONS: Dict[str, Dict[str, Dict[str, str]]] = {
        "official_source_check": {
            "pass": {
                "en": "Verify that your browser address bar displays the official .gov.in domain with HTTPS security.",
                "hi": "जांचें कि आपके ब्राउज़र एड्रेस बार में HTTPS सुरक्षा के साथ आधिकारिक .gov.in डोमेन दिख रहा है।",
                "mr": "आपल्या ब्राउझरच्या अॅड्रेस बारमध्ये HTTPS सुरक्षेसह अधिकृत .gov.in डोमेन दिसत असल्याची खात्री करा.",
            },
            "warning": {
                "en": "Do not enter passwords or upload confidential documents to this third-party website.",
                "hi": "इस तीसरे पक्ष की वेबसाइट पर कोई पासवर्ड न डालें और न ही गोपनीय दस्तावेज़ अपलोड करें।",
                "mr": "या त्रयस्थ संकेतस्थळावर कोणताही पासवर्ड टाकू नका किंवा गोपनीय कागदपत्रे जोडू नका.",
            },
            "fail": {
                "en": "Avoid visiting this link. Access the scheme directly through the concerned ministry's verified portal.",
                "hi": "इस लिंक पर जाने से बचें। संबंधित मंत्रालय के सत्यापित पोर्टल के माध्यम से सीधे योजना तक पहुंचें।",
                "mr": "या लिंकवर जाणे टाळा. संबंधित मंत्रालयाच्या अधिकृत पोर्टलद्वारे थेट योजनेची माहिती मिळवा.",
            },
            "inconclusive": {
                "en": "If you have an official link or brochure URL, submit it for a complete domain authentication.",
                "hi": "यदि आपके पास आधिकारिक लिंक या विवरणिका यूआरएल है, तो पूर्ण डोमेन प्रमाणीकरण के लिए उसे सबमिट करें।",
                "mr": "जर आपल्याकडे अधिकृत लिंक किंवा माहितीपत्रकाची लिंक असेल, तर पूर्ण पडताळणीसाठी ती सादर करा.",
            },
        },
        "linguistic_scam_pattern_check": {
            "pass": {
                "en": "Check eligibility criteria carefully; genuine schemes have strict, documented qualification rules.",
                "hi": "पात्रता नियमों की सावधानीपूर्वक जांच करें; प्रामाणिक योजनाओं में स्पष्ट और दस्तावेजी नियम होते हैं।",
                "mr": "पात्रतेचे निकष काळजीपूर्वक तपासा; खऱ्या शासकीय योजनांमध्ये स्पष्ट आणि लेखी नियम असतात.",
            },
            "warning": {
                "en": "Verify claims through authentic national press releases or official helpline numbers.",
                "hi": "आधिकारिक राष्ट्रीय प्रेस विज्ञप्तियों या सरकारी हेल्पलाइन नंबरों के माध्यम से दावों की पुष्टि करें।",
                "mr": "अधिकृत राष्ट्रीय प्रसिद्धीपत्रके किंवा शासकीय हेल्पलाईन क्रमांकांद्वारे दाव्यांची खात्री करा.",
            },
            "fail": {
                "en": "Never send money, pay processing fees, or share bank account credentials for government scheme benefits.",
                "hi": "सरकारी योजना के लाभ के लिए कभी भी पैसे न भेजें, प्रोसेसिंग शुल्क न दें और न ही बैंक विवरण साझा करें।",
                "mr": "शासकीय योजनेच्या लाभासाठी कधीही पैसे पाठवू नका, प्रक्रिया शुल्क भरू नका किंवा बँकेचा तपशील शेअर करू नका.",
            },
            "inconclusive": {
                "en": "Submit the full announcement text or circular for a comprehensive text evaluation.",
                "hi": "विस्तृत भाषाई विश्लेषण के लिए पूरी घोषणा या परिपत्र का पाठ प्रदान करें।",
                "mr": "सखोल भाषिक विश्लेषणासाठी संपूर्ण घोषणा किंवा परिपत्रकाचा मजकूर सादर करा.",
            },
        },
        "catalogue_similarity_check": {
            "pass": {
                "en": "Follow the official application instructions listed on the government scheme portal.",
                "hi": "सरकारी योजना पोर्टल पर दिए गए आधिकारिक आवेदन निर्देशों का पालन करें।",
                "mr": "शासकीय योजना पोर्टलवर दिलेल्या अधिकृत अर्ज प्रक्रियेचे पालन करा.",
            },
            "warning": {
                "en": "Consult the original portal directly instead of following links from forwarded messages.",
                "hi": "फॉरवर्ड किए गए संदेशों के लिंक पर जाने के बजाय सीधे आधिकारिक पोर्टल पर जाएं।",
                "mr": "फॉरवर्ड केलेल्या संदेशातील लिंक्सवर जाण्याऐवजी थेट अधिकृत पोर्टलला भेट द्या.",
            },
            "fail": {
                "en": "Report misleading scheme titles to cybercrime authorities or the official scheme grievance cell.",
                "hi": "भ्रामक योजना नामों की रिपोर्ट साइबर अपराध शाखा या आधिकारिक योजना शिकायत प्रकोष्ठ को करें।",
                "mr": "दिशाभूल करणाऱ्या योजनांच्या नावांची तक्रार सायबर गुन्हे विभागाकडे किंवा अधिकृत तक्रार निवारण कक्षाकडे करा.",
            },
            "inconclusive": {
                "en": "Search the official myScheme portal (myscheme.gov.in) to locate the authentic program.",
                "hi": "प्रामाणिक कार्यक्रम खोजने के लिए आधिकारिक myScheme पोर्टल (myscheme.gov.in) पर खोजें।",
                "mr": "खरी योजना शोधण्यासाठी अधिकृत myScheme पोर्टल (myscheme.gov.in) वर शोधा.",
            },
        },
        "document_or_url_integrity_check": {
            "pass": {
                "en": "Retain official scheme reference copies for your application records.",
                "hi": "अपने आवेदन रिकॉर्ड के लिए आधिकारिक योजना संदर्भ प्रतियां सुरक्षित रखें।",
                "mr": "आपल्या अर्जाच्या नोंदीसाठी अधिकृत योजनेची संदर्भ प्रत सुरक्षित ठेवा.",
            },
            "warning": {
                "en": "Request an official PDF notification or printed gazette copy from the concerned department.",
                "hi": "संबंधित विभाग से आधिकारिक पीडीएफ अधिसूचना या मुद्रित राजपत्र प्रति का अनुरोध करें।",
                "mr": "संबंधित विभागाकडून अधिकृत पीडीएफ अधिसूचना किंवा मुद्रित राजपत्राची प्रत मिळवा.",
            },
            "fail": {
                "en": "Do not trust altered or doctored flyers. Verify official seals and signatures independently.",
                "hi": "छेड़छाड़ किए गए पर्चों पर भरोसा न करें। आधिकारिक मुहरों और हस्ताक्षरों की स्वतंत्र रूप से पुष्टि करें।",
                "mr": "बनावट पत्रकांवर विश्वास ठेवू नका. अधिकृत शिक्के आणि स्वाक्षऱ्यांची स्वतंत्रपणे खात्री करा.",
            },
            "inconclusive": {
                "en": "Provide a high-resolution image or official government circular for full verification.",
                "hi": "पूर्ण सत्यापन के लिए उच्च-गुणवत्ता वाली छवि या आधिकारिक सरकारी परिपत्र प्रदान करें।",
                "mr": "संपूर्ण पडताळणीसाठी स्पष्ट फोटो किंवा अधिकृत शासकीय परिपत्रक सादर करा.",
            },
        },
    }

    ERROR_TRANSLATIONS: Dict[str, Dict[str, str]] = {
        "unauthorized": {
            "en": "Authentication is required to access this verification record.",
            "hi": "इस सत्यापन रिकॉर्ड तक पहुँचने के लिए प्रमाणीकरण आवश्यक है।",
            "mr": "या पडताळणी नोंदीमध्ये प्रवेश करण्यासाठी प्रमाणीकरण आवश्यक आहे.",
        },
        "forbidden": {
            "en": "You do not have permission to view or modify this verification record.",
            "hi": "आपको इस सत्यापन रिकॉर्ड को देखने या संशोधित करने की अनुमति नहीं है।",
            "mr": "तुम्हाला ही पडताळणी नोंद पाहण्याची किंवा बदलण्याची परवानगी नाही.",
        },
        "not_found": {
            "en": "The requested scheme verification record was not found.",
            "hi": "अनुरोधित योजना सत्यापन रिकॉर्ड नहीं मिला।",
            "mr": "विनंती केलेली योजना पडताळणी नोंद आढळली नाही.",
        },
        "validation_error": {
            "en": "Invalid input provided for scheme verification. Please verify required fields.",
            "hi": "योजना सत्यापन के लिए अमान्य इनपुट प्रदान किया गया। कृपया आवश्यक फ़ील्ड की जांच करें।",
            "mr": "योजना पडताळणीसाठी अवैध माहिती दिली आहे. कृपया आवश्यक रकाने तपासा.",
        },
        "server_error": {
            "en": "An unexpected server error occurred during verification processing. Please try again.",
            "hi": "सत्यापन प्रक्रिया के दौरान एक अप्रत्याशित सर्वर त्रुटि हुई। कृपया पुनः प्रयास करें।",
            "mr": "पडताळणी प्रक्रियेदरम्यान अनपेक्षित सर्व्हर त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
        },
        "inconclusive": {
            "en": "Public evidence is currently inconclusive for definitive verification.",
            "hi": "निश्चित सत्यापन के लिए सार्वजनिक साक्ष्य वर्तमान में अनिर्णायक हैं।",
            "mr": "निश्चित पडताळणीसाठी सार्वजनिक पुरावा सध्या अनिर्णित आहे.",
        },
    }

    @classmethod
    def get_localized_error(cls, error_key: str, lang: str = "en") -> str:
        """Returns citizen-friendly localized error text in the requested language."""
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"
        return cls.ERROR_TRANSLATIONS.get(error_key, {}).get(lang_key, error_key)

    @classmethod
    def get_localized_label(cls, label: str, lang: str = "en") -> str:
        """Returns the localized title for the result label."""
        norm_label = (label or "unable_to_verify").lower().strip()
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"
        return cls.LABEL_TRANSLATIONS.get(norm_label, {}).get(lang_key, norm_label)

    @classmethod
    def get_status_meaning(cls, label: str, lang: str = "en") -> str:
        """Explains what the status code means to an ordinary citizen."""
        norm_label = (label or "unable_to_verify").lower().strip()
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"
        return cls.STATUS_MEANINGS.get(norm_label, {}).get(lang_key, "")

    @classmethod
    def get_recommendations(cls, label: str, lang: str = "en") -> List[str]:
        """Returns localized citizen safety advice based on the verification result."""
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"
        norm_label = (label or "unable_to_verify").lower().strip()

        recommendations_catalog = {
            "genuine": {
                "en": [
                    "Verify your personal eligibility against official ministerial criteria before applying.",
                    "Apply exclusively through the verified portal ending in .gov.in or .nic.in.",
                    "Visit your nearest Common Service Centre (CSC) if you need official offline assistance.",
                ],
                "hi": [
                    "आवेदन करने से पहले आधिकारिक मंत्रालय नियमों के अनुसार अपनी व्यक्तिगत पात्रता जांचें।",
                    "केवल .gov.in या .nic.in पर समाप्त होने वाले सत्यापित पोर्टल के माध्यम से ही आवेदन करें।",
                    "यदि आपको आधिकारिक ऑफलाइन सहायता चाहिए, तो अपने निकटतम कॉमन सर्विस सेंटर (सीएससी) से संपर्क करें।",
                ],
                "mr": [
                    "अर्ज करण्यापूर्वी अधिकृत मंत्रालय नियमांनुसार आपल्या वैयक्तिक पात्रतेची खात्री करा.",
                    "केवळ .gov.in किंवा .nic.in ने समाप्त होणाऱ्या पडताळलेल्या संकेतस्थळावरूनच अर्ज करा.",
                    "ऑफलाइन मदतीसाठी आपल्या जवळच्या कॉमन सर्व्हिस सेंटर (सीएससी) शी संपर्क साधा.",
                ],
            },
            "suspicious": {
                "en": [
                    "Do not click unverified links or submit confidential documents on third-party portals.",
                    "Never transfer fees or pay registration charges for government welfare schemes.",
                    "Cross-check the announcement on the official national portal (myscheme.gov.in).",
                ],
                "hi": [
                    "तीसरे पक्ष के पोर्टलों पर असत्यापित लिंक पर क्लिक न करें और न ही गोपनीय दस्तावेज़ जमा करें।",
                    "सरकारी योजनाओं के लिए कभी भी पैसे न भेजें और न ही पंजीकरण शुल्क का भुगतान करें।",
                    "आधिकारिक राष्ट्रीय पोर्टल (myscheme.gov.in) पर इस घोषणा की दोबारा पुष्टि करें।",
                ],
                "mr": [
                    "त्रयस्थ संकेतस्थळांवर असत्यापित लिंक्सवर क्लिक करू नका किंवा गोपनीय कागदपत्रे देऊ नका.",
                    "शासकीय कल्याणकारी योजनांसाठी कधीही पैसे पाठवू नका किंवा नोंदणी शुल्क भरू नका.",
                    "अधिकृत राष्ट्रीय पोर्टलवर (myscheme.gov.in) या घोषणेची पुन्हा खात्री करा.",
                ],
            },
            "potentially_fake": {
                "en": [
                    "Immediately stop interaction with this scheme announcement or message.",
                    "Never share OTPs, bank account numbers, UPI PINs, or Aadhaar credentials.",
                    "Report suspected fraud to the National Cyber Crime Portal (cybercrime.gov.in or helpline 1930).",
                ],
                "hi": [
                    "इस योजना घोषणा या संदेश के साथ तुरंत बातचीत बंद करें।",
                    "कभी भी ओटीपी, बैंक खाता नंबर, यूपीआई पिन या आधार क्रेडेंशियल साझा न करें।",
                    "संदिग्ध धोखाधड़ी की रिपोर्ट राष्ट्रीय साइबर अपराध पोर्टल (cybercrime.gov.in या हेल्पलाइन 1930) पर करें।",
                ],
                "mr": [
                    "या योजनेच्या घोषणेशी किंवा संदेशाशी संबंधित सर्व संपर्क त्वरित थांबवा.",
                    "कधीही ओटीपी, बँक खाते क्रमांक, यूपीआय पिन किंवा आधार तपशील शेअर करू नका.",
                    "संशयास्पद फसवणुकीची तक्रार राष्ट्रीय सायबर गुन्हे पोर्टलवर (cybercrime.gov.in किंवा हेल्पलाइन १९३०) करा.",
                ],
            },
            "duplicate": {
                "en": [
                    "Access the authentic ministerial portal directly rather than third-party mirrors.",
                    "Verify the latest official guidelines, fee exemptions, and application deadlines.",
                    "Do not trust unofficial blogs or social media channels claiming faster approvals.",
                ],
                "hi": [
                    "तीसरे पक्ष के मिरर लिंक के बजाय सीधे प्रामाणिक मंत्रालय पोर्टल पर जाएं।",
                    "नवीनतम आधिकारिक दिशानिर्देशों, शुल्क छूट और आवेदन की अंतिम तिथि की पुष्टि करें।",
                    "शीघ्र स्वीकृति का दावा करने वाले अनौपचारिक ब्लॉगों या सोशल मीडिया चैनलों पर विश्वास न करें।",
                ],
                "mr": [
                    "त्रयस्थ लिंक्सऐवजी थेट अधिकृत मंत्रालयीन संकेतस्थळाला भेट द्या.",
                    "नवीनतम अधिकृत मार्गदर्शक तत्त्वे, शुल्क सवलत आणि अर्जाच्या मुदतीची खात्री करा.",
                    "लवकर मंजुरी मिळवून देण्याचा दावा करणाऱ्या अनधिकृत ब्लॉग्स किंवा सोशल मीडिया चॅनेल्सवर विश्वास ठेवू नका.",
                ],
            },
            "unable_to_verify": {
                "en": [
                    "Do not share personal details until the scheme is corroborated by an official source.",
                    "Search the national portal (myscheme.gov.in) using the claimed scheme name.",
                    "Consult your local Gram Panchayat, Ward Office, or District Collectorate for confirmation.",
                ],
                "hi": [
                    "जब तक योजना किसी आधिकारिक स्रोत द्वारा सत्यापित न हो जाए, व्यक्तिगत विवरण साझा न करें।",
                    "दावा किए गए योजना नाम का उपयोग करके राष्ट्रीय पोर्टल (myscheme.gov.in) पर खोजें।",
                    "पुष्टि के लिए अपनी स्थानीय ग्राम पंचायत, वार्ड कार्यालय या जिला कलेक्ट्रेट से संपर्क करें।",
                ],
                "mr": [
                    "योजनेची अधिकृत स्रोताकडून खात्री होईपर्यंत वैयक्तिक माहिती शेअर करू नका.",
                    "दावा केलेल्या योजनेच्या नावाने राष्ट्रीय पोर्टलवर (myscheme.gov.in) शोध घ्या.",
                    "खात्री करण्यासाठी आपल्या स्थानिक ग्रामपंचायत, प्रभाग कार्यालय किंवा जिल्हाधिकारी कार्यालयाशी संपर्क साधा.",
                ],
            },
        }
        return recommendations_catalog.get(norm_label, recommendations_catalog["unable_to_verify"]).get(lang_key, [])

    @classmethod
    def get_limitations(cls, lang: str = "en") -> List[str]:
        """Returns localized legal and methodology limitations."""
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"
        limitations_catalog = {
            "en": [
                "SchemeShield AI provides automated pattern and domain corroboration; it does not issue judicial certifications.",
                "Government scheme rules, ministerial allocations, and deadlines are subject to periodic official revisions.",
                "Absence of detected scam words does not constitute official certification of authenticity.",
                "Always verify final eligibility and file applications on official portals ending in .gov.in or .nic.in.",
            ],
            "hi": [
                "स्कीमशील्ड एआई स्वचालित पैटर्न एवं डोमेन विश्लेषण प्रदान करता है; यह कोई न्यायिक या कानूनी प्रमाणन जारी नहीं करता।",
                "सरकारी योजना के नियम, बजट आवंटन और समय-सीमा आधिकारिक संशोधनों के अधीन हैं।",
                "आपत्तिजनक शब्दों की अनुपस्थिति योजना के आधिकारिक रूप से प्रामाणिक होने का स्वतः प्रमाण नहीं है।",
                "अंतिम पात्रता की पुष्टि हमेशा .gov.in या .nic.in पर समाप्त होने वाले आधिकारिक पोर्टल पर ही करें।",
            ],
            "mr": [
                "स्कीमशील्ड एआय स्वयंचलित पॅटर्न व डोमेन विश्लेषण पुरवते; हे कोणतेही न्यायालयीन किंवा कायदेशीर प्रमाणपत्र देत नाही.",
                "शासकीय योजनेचे नियम, तरतुदी आणि मुदत वेळोवेळी होणाऱ्या अधिकृत बदलांच्या अधीन असतात.",
                "संशयास्पद शब्दांचा अभाव असणे म्हणजे योजना अधिकृत असल्याचे थेट प्रमाणपत्र नव्हे.",
                "अंतिम पात्रतेची खात्री नेहमी .gov.in किंवा .nic.in ने समाप्त होणाऱ्या अधिकृत पोर्टलवरच करा.",
            ],
        }
        return limitations_catalog.get(lang_key, limitations_catalog["en"])

    @classmethod
    def format_score_justification(
        cls,
        risk_score: float,
        confidence_score: float,
        result_label: str,
        contributions: List[Dict[str, Any]],
        lang: str = "en",
    ) -> str:
        """
        Produces a transparent, step-by-step narrative explaining why this risk score was assigned.
        """
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"
        label_text = cls.get_localized_label(result_label, lang_key)

        increases = [
            c for c in contributions
            if c.get("direction") == "increase" and c.get("component") != "Baseline Risk"
        ]
        decreases = [c for c in contributions if c.get("direction") == "decrease"]

        if lang_key == "hi":
            parts = [
                f"अंतिम जोखिम स्कोर {risk_score:.1f}/100 है (वर्गीकरण: {label_text})।",
                "यह स्कोर 20.0 के तटस्थ आधार (बेसलाइन) से शुरू हुआ।",
            ]
            if decreases:
                pts = sum(abs(c.get("points", 0)) for c in decreases)
                parts.append(f"आधिकारिक सरकारी पोर्टल पुष्टि के कारण जोखिम में {pts:.1f} अंकों की कमी की गई।")
            if increases:
                pts = sum(abs(c.get("points", 0)) for c in increases)
                parts.append(f"पहचाने गए चेतावनी संकेतों या असत्यापित डोमेन के कारण जोखिम में {pts:.1f} अंकों की वृद्धि हुई।")
            parts.append(f"साक्ष्य निश्चितता स्कोर {confidence_score:.1f}/100 है।")
            return " ".join(parts)

        elif lang_key == "mr":
            parts = [
                f"अंतिम जोखीम स्कोअर {risk_score:.1f}/100 आहे (निष्कर्ष: {label_text}).",
                "हा स्कोअर 20.0 च्या तटस्थ बेसलाइनपासून मोजण्यात आला.",
            ]
            if decreases:
                pts = sum(abs(c.get("points", 0)) for c in decreases)
                parts.append(f"अधिकृत शासकीय संकेतस्थळाच्या पडताळणीमुळे जोखमीत {pts:.1f} गुणांची घट झाली.")
            if increases:
                pts = sum(abs(c.get("points", 0)) for c in increases)
                parts.append(f"आढळलेले संशयास्पद घटक किंवा अनधिकृत डोमेनमुळे जोखमीत {pts:.1f} गुणांची वाढ झाली.")
            parts.append(f"पुरावा निश्चितता स्कोअर {confidence_score:.1f}/100 आहे.")
            return " ".join(parts)

        else:
            parts = [
                f"The final risk score is {risk_score:.1f}/100 ({label_text}).",
                "The score commenced at a neutral baseline of 20.0.",
            ]
            if decreases:
                pts = sum(abs(c.get("points", 0)) for c in decreases)
                parts.append(f"Corroboration on an official government portal reduced risk by {pts:.1f} points.")
            if increases:
                pts = sum(abs(c.get("points", 0)) for c in increases)
                parts.append(f"Identified risk indicators or unverified third-party claims increased risk by {pts:.1f} points.")
            parts.append(f"Observable evidence confidence is {confidence_score:.1f}/100.")
            return " ".join(parts)

    @classmethod
    def format_missing_evidence_impact(
        cls,
        evidence_coverage: str,
        submitted_url: Optional[str] = None,
        text_length: int = 0,
        lang: str = "en",
    ) -> str:
        """
        Explains how missing evidence affects certainty, ensuring missing evidence
        is never automatically treated as fraud.
        """
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"

        has_url = bool(submitted_url and submitted_url.strip())

        if lang_key == "hi":
            if evidence_coverage == "complete":
                return "पूर्ण साक्ष्य (विस्तृत पाठ एवं वेब लिंक) प्रदान किया गया और उसका सभी आयामों पर विश्लेषण किया गया।"
            elif not has_url:
                return "डोमेन सत्यापन के लिए कोई आधिकारिक वेब लिंक प्रदान नहीं किया गया था। यह साक्ष्य की कमी और अनिश्चितता को दर्शाता है, इसे सीधे धोखाधड़ी नहीं माना जा सकता।"
            else:
                return "प्रस्तुत विवरण संक्षिप्त है। प्रणाली निष्पक्षता बनाए रखती है और ठोस प्रमाण के बिना किसी योजना को गलत घोषित नहीं करती।"

        elif lang_key == "mr":
            if evidence_coverage == "complete":
                return "पूर्ण पुरावा (सविस्तर मजकूर आणि वेब लिंक) सादर केला गेला असून सर्व निकषांवर त्याचे विश्लेषण करण्यात आले आहे."
            elif not has_url:
                return "डोमेन पडताळणीसाठी कोणतीही अधिकृत वेब लिंक दिली नव्हती. हे पुराव्याची कमतरता आणि अनिश्चितता दर्शवते, हा स्वतःहून फसवणुकीचा पुरावा नाही."
            else:
                return "सादर केलेला तपशील मर्यादित आहे. प्रणाली तटस्थता राखते आणि स्पष्ट पुराव्याशिवाय कोणत्याही योजनेला फसवणूक ठरवत नाही."

        else:
            if evidence_coverage == "complete":
                return "Comprehensive evidence was provided and evaluated across all verification dimensions."
            elif not has_url:
                return "No official web link was submitted for domain corroboration. This creates an evidence gap and lowers confidence, but is NOT counted as proof of a scam."
            else:
                return "Submitted text details are limited. The system maintains neutrality and avoids jumping to conclusions without tangible proof."

    @classmethod
    def build_localized_checks(
        cls,
        checks: List[Dict[str, Any]],
        lang: str = "en",
    ) -> List[Dict[str, Any]]:
        """
        Translates check titles, findings, and recommended actions into the target language.
        """
        lang_key = lang.lower().strip() if lang in cls.SUPPORTED_LANGUAGES else "en"
        localized_checks = []

        for chk in checks:
            cid = chk.get("check_id", "")
            res = chk.get("result", "inconclusive")

            name_dict = cls.CHECK_TITLES.get(cid, {})
            title = name_dict.get(lang_key, chk.get("name", cid))

            finding_dict = cls.CHECK_FINDINGS.get(cid, {}).get(res, {})
            action_dict = cls.CHECK_ACTIONS.get(cid, {}).get(res, {})

            finding_text = chk.get("explanation", {}).get(lang_key) or finding_dict.get(lang_key, chk.get("finding", ""))
            action_text = action_dict.get(lang_key, chk.get("recommended_action", ""))

            localized_checks.append({
                "check_id": cid,
                "name": title,
                "result": res,
                "finding": finding_text,
                "evidence_url": chk.get("evidence_url"),
                "score_contribution": chk.get("score_contribution", 0.0),
                "score_reason": chk.get("score_reason"),
                "confidence": chk.get("confidence"),
                "coverage": chk.get("coverage", "complete"),
                "recommended_action": action_text,
                "explanation": chk.get("explanation", {}),
            })

        return localized_checks

    @classmethod
    def generate_trilingual_bundle(
        cls,
        risk_score: float,
        confidence_score: float,
        result_label: str,
        scheme_name: str,
        submitted_url: Optional[str],
        text_length: int,
        contributions: List[Dict[str, Any]],
        checks: List[Dict[str, Any]],
        evidence_coverage: str = "partial",
    ) -> Dict[str, Any]:
        """
        Generates the complete trilingual bundle containing identical scores
        and aligned explanations in English, Hindi, and Marathi.
        """
        bundle: Dict[str, Any] = {}

        for lang in cls.SUPPORTED_LANGUAGES:
            localized_label = cls.get_localized_label(result_label, lang)
            status_meaning = cls.get_status_meaning(result_label, lang)
            score_just = cls.format_score_justification(risk_score, confidence_score, result_label, contributions, lang)
            missing_impact = cls.format_missing_evidence_impact(evidence_coverage, submitted_url, text_length, lang)
            recoms = cls.get_recommendations(result_label, lang)
            limits = cls.get_limitations(lang)
            loc_checks = cls.build_localized_checks(checks, lang)

            # Generate natural summary
            if result_label == "genuine":
                if lang == "hi":
                    summary = f"'{scheme_name}' सत्यापित आधिकारिक सरकारी रिकॉर्ड से मेल खाती है और वैध सरकारी पोर्टल से समर्थित है।"
                elif lang == "mr":
                    summary = f"'{scheme_name}' ही योजना पडताळणी केलेल्या अधिकृत शासकीय नोंदींशी सुसंगत असून वैध पोर्टलवर उपलब्ध आहे."
                else:
                    summary = f"'{scheme_name}' matches verified official government records with legitimate portal provenance."
            elif result_label in ("suspicious", "potentially_fake"):
                if lang == "hi":
                    summary = f"सावधानी: '{scheme_name}' में गैर-सत्यापित बाहरी लिंक या संदिग्ध वित्तीय दावों के संकेत मिले हैं।"
                elif lang == "mr":
                    summary = f"सावधान: '{scheme_name}' मध्ये अपडताळणीकृत बाह्य लिंक्स किंवा संशयास्पद आर्थिक दाव्यांचे संकेत आढळले आहेत."
                else:
                    summary = f"Caution: '{scheme_name}' exhibits indicators of unverified claims or suspicious third-party channels."
            elif result_label == "duplicate":
                if lang == "hi":
                    summary = f"'{scheme_name}' किसी वास्तविक सरकारी कार्यक्रम से मिलती-जुलती है, लेकिन अनौपचारिक चैनल पर प्रसारित हो रही है।"
                elif lang == "mr":
                    summary = f"'{scheme_name}' खऱ्या शासकीय कार्यक्रमासारखी दिसते, परंतु ती अनधिकृत माध्यमांतून फिरत आहे."
                else:
                    summary = f"'{scheme_name}' appears to mirror a genuine government program, but is being circulated through uncorroborated channels."
            else:
                if lang == "hi":
                    summary = f"'{scheme_name}' के लिए सार्वजनिक साक्ष्य अनिर्णायक रहे। पूर्ण पुष्टि के लिए आधिकारिक सरकारी पोर्टल देखें।"
                elif lang == "mr":
                    summary = f"'{scheme_name}' बाबत सार्वजनिक पुरावा अनिर्णित आहे. अधिकृत माहितीसाठी शासकीय पोर्टलचा संदर्भ घ्या."
                else:
                    summary = f"Verification inconclusive for '{scheme_name}'. Public evidence is insufficient to verify official backing."

            bundle[lang] = {
                "language": lang,
                "result_label_localized": localized_label,
                "summary": summary,
                "score_justification": score_just,
                "status_meaning": status_meaning,
                "checks": loc_checks,
                "missing_evidence_impact": missing_impact,
                "recommendations": recoms,
                "limitations": limits,
            }

        is_complete, missing_fields = cls.validate_bundle_completeness(bundle)
        completeness_status = "complete" if is_complete else "incomplete"
        for lang in cls.SUPPORTED_LANGUAGES:
            if lang in bundle:
                bundle[lang]["localization_completeness"] = completeness_status

        return bundle

    @classmethod
    def validate_bundle_completeness(cls, bundle: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validates that all supported languages (en, hi, mr) are fully populated
        with non-empty summaries, status meanings, score justifications, checks,
        recommendations, and limitations.
        """
        missing: List[str] = []
        for lang in cls.SUPPORTED_LANGUAGES:
            if lang not in bundle:
                missing.append(f"missing_language_{lang}")
                continue
            item = bundle[lang]
            for field in ["summary", "status_meaning", "score_justification", "missing_evidence_impact"]:
                if not item.get(field) or not str(item[field]).strip():
                    missing.append(f"{lang}.{field}")
            if not item.get("recommendations") or len(item["recommendations"]) == 0:
                missing.append(f"{lang}.recommendations")
            if not item.get("limitations") or len(item["limitations"]) == 0:
                missing.append(f"{lang}.limitations")
            for chk in item.get("checks", []):
                cid = chk.get("check_id")
                if not chk.get("finding"):
                    missing.append(f"{lang}.check.{cid}.finding")
                if not chk.get("recommended_action"):
                    missing.append(f"{lang}.check.{cid}.recommended_action")

        return len(missing) == 0, missing

    @classmethod
    def resolve_language(cls, lang: Optional[str] = None, language: Optional[str] = None) -> str:
        """
        Validates and returns the normalized language code (en, hi, mr).
        Raises 422 AppException if unsupported.
        """
        selected = (lang or language or "en").lower().strip()
        if selected not in cls.SUPPORTED_LANGUAGES:
            raise AppException(
                message=f"Unsupported language '{selected}'. Supported languages are: {', '.join(cls.SUPPORTED_LANGUAGES)}.",
                status_code=422,
            )
        return selected

    @classmethod
    def get_or_create_explanation_bundle(cls, record: Any) -> Dict[str, Any]:
        """
        Retrieves saved trilingual bundle and score breakdown from record.evidence,
        or dynamically generates it if missing (for backwards compatibility).
        """
        evidence = record.evidence or {}
        trilingual_bundle = evidence.get("trilingual_explanations")
        score_breakdown = evidence.get("score_breakdown")

        if trilingual_bundle and score_breakdown:
            return {
                "trilingual_explanations": trilingual_bundle,
                "score_breakdown": score_breakdown,
                "scoring_policy_version": getattr(record, "scoring_policy_version", None) or evidence.get("scoring_policy_version", "2.0"),
                "evidence_coverage": getattr(record, "evidence_coverage", None) or evidence.get("evidence_coverage", "partial"),
                "localization_completeness": getattr(record, "localization_completeness", None) or "complete",
            }

        # Dynamically synthesize if missing
        checks = evidence.get("checks", [])
        contributions = [{
            "component": "Baseline Risk",
            "points": 20.0,
            "direction": "increase",
            "description": "Standard baseline risk assigned to unverified public announcements.",
            "description_hi": "गैर-सत्यापित सार्वजनिक घोषणाओं के लिए 20.0 अंकों का तटस्थ आधार स्तर।",
            "description_mr": "अपडताळणीकृत सार्वजनिक घोषणांसाठी 20.0 गुणांचा तटस्थ आधारभूत स्तर.",
        }]
        risk = record.risk_score if record.risk_score is not None else 20.0
        if risk != 20.0:
            delta = round(risk - 20.0, 1)
            contributions.append({
                "component": "Risk Adjustments",
                "points": delta,
                "direction": "increase" if delta > 0 else "decrease",
                "description": "Risk adjustment based on content and source evaluation.",
                "description_hi": "सामग्री और स्रोत मूल्यांकन पर आधारित जोखिम समायोजन।",
                "description_mr": "मजकूर आणि स्रोत मूल्यांकनावर आधारित जोखीम समायोजन.",
            })

        evidence_coverage = getattr(record, "evidence_coverage", None) or "partial"
        bundle = cls.generate_trilingual_bundle(
            risk_score=risk,
            confidence_score=record.confidence_score if record.confidence_score is not None else 50.0,
            result_label=record.result_label or "unable_to_verify",
            scheme_name=record.scheme_name or "Submitted Scheme",
            submitted_url=record.submitted_url,
            text_length=len(record.scheme_name or ""),
            contributions=contributions,
            checks=checks,
            evidence_coverage=evidence_coverage,
        )
        sb = {
            "base_score": 20.0,
            "contributions": contributions,
            "final_risk_score": risk,
            "confidence_score": record.confidence_score if record.confidence_score is not None else 50.0,
            "evidence_coverage": evidence_coverage,
            "scoring_policy_version": getattr(record, "scoring_policy_version", None) or "2.0",
        }
        return {
            "trilingual_explanations": bundle,
            "score_breakdown": sb,
            "scoring_policy_version": getattr(record, "scoring_policy_version", None) or "2.0",
            "evidence_coverage": evidence_coverage,
        }

    @classmethod
    def generate_multilingual_explanation(
        cls,
        result_label: str,
        risk_score: float,
        confidence_score: float,
        scheme_name: str,
        submitted_url: Optional[str] = None,
        text_length: int = 100,
        contributions: Optional[List[Dict[str, Any]]] = None,
        checks: Optional[List[Dict[str, Any]]] = None,
        evidence_coverage: str = "partial",
    ) -> Dict[str, Any]:
        """
        Legacy wrapper generating trilingual translations with scores dictionary.
        """
        bundle = cls.generate_trilingual_bundle(
            risk_score=risk_score,
            confidence_score=confidence_score,
            result_label=result_label,
            scheme_name=scheme_name,
            submitted_url=submitted_url,
            text_length=text_length,
            contributions=contributions or [{
                "component": "Baseline Risk",
                "points": 20.0,
                "direction": "increase",
                "description": "Standard baseline risk assigned to unverified public announcements.",
            }],
            checks=checks or [],
            evidence_coverage=evidence_coverage,
        )
        return {
            "scores": {
                "risk_score": risk_score,
                "confidence_score": confidence_score,
                "result_label": result_label,
            },
            "translations": bundle,
        }


multilingual_service = MultilingualExplanationService()

