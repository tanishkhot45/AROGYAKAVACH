import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Official IDSP Form P — 22 diseases exactly as per government format ──────
const DISEASE_DICT = [{"id":"ADD","sno":1,"label":"Acute Diarrhoeal Disease (including acute gastroenteritis)","kw":["diarrhea","diarrhoea","loose motion","loose stool","watery stool","gastroenteritis","gastro","loose bowel","frequent stool","bowel looseness","loose potty","watery motions","runny stool","stomach infection","stomach upset","gut infection","intestinal infection","intestinal upset","loose","दस्त","पतला दस्त","लूज़ मोशन","पेट खराब","पानी जैसा दस्त","उल्टी दस्त","पेट की बीमारी","पेट में दर्द दस्त","पेट की गड़बड़","दस्त लगना","दस्त होना","पतला पाखाना","बार बार दस्त","पेचिश","हैजा जैसा","गैस्ट्रो","उदर रोग","जुलाब","अतिसार","पातळ संडास","पोट बिघडणे","जुलाब होणे","पाण्यासारखे जुलाब","पोटदुखी जुलाब","पोटाचा आजार","उलट्या जुलाब","संडास सुटणे","वारंवार संडास","पातळ मल","पोट खराब होणे","आमांश","tummy trouble","bowel issues","digestive upset","diarrhoeal disease","gastrointestinal","gi upset","stool frequency","acuteGE","आंत की समस्या","पाचन गड़बड़","हाजमा खराब","पेट संक्रमण","आंत्र रोग","अतिसार","जलीय मल","पचनसंस्था बिघडणे","पोटाची समस्या","आतड्याचा आजार","तीव्र अतिसार","पचन बिघडणे"]},{"id":"BDY","sno":2,"label":"Bacillary Dysentery","kw":["bacillary dysentery","bloody diarrhea","blood in stool","mucus stool","blood stool","dysentery","shigella","bloody loose motion","stools with blood","stools with mucus","hemorrhagic diarrhea","rectal bleeding stool","खूनी दस्त","रक्त वाले दस्त","खूनी पेचिश","खून मिला दस्त","मल में खून","पेचिश","श्लेष्म दस्त","बलगम दस्त","रक्त अतिसार","खूनी पाखाना","रक्त सहित मल","रक्ताचे जुलाब","रक्ती हगवण","रक्त मिश्रित संडास","रक्तांश अतिसार","खूनी जुलाब","आव पडणे","श्लेष्म जुलाब","आव रक्त जुलाब","रक्ताची हगवण","पेचिश","shigellosis","bacterial diarrhea","invasive diarrhea","dysenteric stool","enteritis bloody","जीवाणु दस्त","शिगेला","बैक्टीरिया पेचिश","आंत्र शोथ","खूनी आंत्र","जीवाणूजन्य जुलाब","शिगेला","जीवाणू पेचिश","आतड्याची जळजळ"]},{"id":"VH","sno":3,"label":"Viral Hepatitis","kw":["jaundice","hepatitis","viral hepatitis","yellow eyes","yellow skin","yellowing","liver disease","hepatitis a","hepatitis b","hepatitis e","liver infection","yellow jaundice","icteric fever","dark urine jaundice","yellow body","liver problem","pilia","piliya","पीलिया","पीलिया रोग","जांडिस","हेपेटाइटिस","यकृत रोग","लीवर की बीमारी","पित्त रोग","पीली आंखें","पीली त्वचा","गहरा पेशाब","पीला बुखार","कामला","यकृत सूजन","लिवर इन्फेक्शन","आंखें पीली","पिला बुखार","कावीळ","कमळ","पांडुरोग","यकृत रोग","हिपॅटायटिस","डोळे पिवळे","अंग पिवळे","लिव्हर आजार","पिवळी साथ","मूत्र गडद","यकृत सूज","पिवळा आजार","कावीळ होणे","लिव्हर इन्फेक्शन","hep a","hep b","hep e","acute liver failure","obstructive jaundice","infective hepatitis","serum hepatitis","icterus","हेप ए","हेप बी","हेप ई","तीव्र यकृत विफलता","संक्रामक पीलिया","सीरम हेपेटाइटिस","पीतज्वर","हेप ए","हेप बी","हेप ई","तीव्र यकृत निकामी","संसर्गजन्य कावीळ","रक्त कावीळ"]},{"id":"TYP","sno":4,"label":"Enteric Fever","kw":["typhoid","enteric fever","typhoid fever","salmonella","paratyphoid","sustained fever","prolonged fever","continuous fever","slow fever","typhi","intestinal fever","abdominal fever","tifo","tifoid","टाइफाइड","मियादी बुखार","आंत्र ज्वर","विषम ज्वर","टायफाइड बुखार","लंबा बुखार","सालमोनेला","पेट बुखार","तेज बुखार लंबे समय","धीमा बुखार","विषमज्वर","टायफॉइड","मोठा ताप","आतड्याचा ताप","दीर्घकाळ ताप","सलग ताप","विषमज्वर होणे","तीव्र ताप","सालमोनेला","पोटाचा ताप","enteric","typhus","gut fever","rose spots fever","stepladder fever","enteric infection","आंत्र","टाइफस","गुलाबी दाने बुखार","आंत संक्रमण","सीढ़ी बुखार","आतड्याचा संसर्ग","टायफस","गुलाबी ठिपके ताप","आतडे ताप"]},{"id":"MAL","sno":5,"label":"Malaria","kw":["malaria","plasmodium","falciparum","vivax","malaria fever","malarial fever","paludism","swamp fever","mosquito fever","chills fever","rigor fever","alternating fever","malarie","maleria","मलेरिया","मलेरिया बुखार","ठंड बुखार","कंपकंपी बुखार","मच्छर बुखार","प्लेज़मोडियम","फालसीपेरम","बेहोशी बुखार","कांपना बुखार","रुक रुक बुखार","हिवताप","मलेरिया","थंडीताप","कापरे भरणे","डासाचा ताप","प्लाझमोडियम","फाल्सीपेरम","थंडी ताप","मलेरिया ताप","हिवाळी ताप","थंडी वाजणे ताप","p falciparum","p vivax","p malariae","cerebral malaria","severe malaria","blackwater fever","remittent fever","malarial","malaria case","सेरेब्रल मलेरिया","गंभीर मलेरिया","रुक-रुक बुखार","मलेरिया का केस","विवेक्स","मेंदूचा मलेरिया","गंभीर मलेरिया","मलेरियाचा केस","थांबत थांबत ताप"]},{"id":"DEN","sno":6,"label":"Dengue / DHF / DSS","kw":["dengue","dengue fever","dhf","dss","dengue hemorrhagic fever","dengue shock syndrome","breakbone fever","platelet low","platelet drop","aedes mosquito fever","dengoo","dengue virus","low platelet","rash fever dengue","डेंगू","डेंगू बुखार","डेंगी","प्लेटलेट कम","रक्त प्लेटलेट","हड्डी दर्द बुखार","डेंगू हेमरेजिक","डेंगू शॉक","मच्छर जनित बुखार","प्लेटलेट गिरना","डेंगी बुखार","डेंग्यू","डेंगू ताप","प्लेटलेट कमी","रक्त पेशी कमी","हाडे दुखणे ताप","डेंगी","प्लेटलेट घसरणे","डासजन्य ताप","डेंगू विषाणू","dengue ns1","ns1 positive","dengue igm","retro orbital pain","eye pain fever","hemorrhagic fever","dengue case","एनएस1 पॉजिटिव","आंख दर्द बुखार","रक्तस्रावी बुखार","डेंगू का केस","रेट्रो ऑर्बिटल","एनएस1 पॉझिटिव","डोळ्यांचे दुखणे ताप","रक्तस्रावी ताप","डेंगूचा केस"]},{"id":"CHI","sno":7,"label":"Chikungunya","kw":["chikungunya","chik","joint pain fever","chikunguniya","chikangunya","arthralgia fever","joint swelling fever","chikungunya virus","body ache fever","joint ache","chikv","joint pain","चिकनगुनिया","जोड़ों का दर्द बुखार","चिकनगुनिया बुखार","जोड़ दर्द","सूजन बुखार","हड्डी दर्द","जकड़न बुखार","शरीर दर्द बुखार","जोड़ो में सूजन","चिकुनगुनिया","सांधेदुखी ताप","जोड दुखणे ताप","सांधे सूज ताप","अंग दुखणे ताप","चिकुनगुनिया विषाणू","सांधे जडणे","सांधे दुखणे","chikv positive","bilateral joint pain","polyarthritis fever","debilitating joint pain","chronic joint fever","द्विपक्षीय जोड़ दर्द","पॉलीआर्थराइटिस बुखार","जीर्ण जोड़ बुखार","जोड़ों की जकड़न बुखार","दोन्ही बाजू सांधेदुखी","पॉलीआर्थरायटिस ताप","दीर्घकालीन सांधेदुखी"]},{"id":"AES","sno":8,"label":"Acute Encephalitis Syndrome","kw":["encephalitis","aes","brain fever","brain swelling","brain infection","acute encephalitis","cerebral infection","viral encephalitis","japanese encephalitis","je","seizure fever","convulsion fever","unconscious fever","coma fever","brain inflammation","मस्तिष्क ज्वर","दिमाग बुखार","एन्सेफेलाइटिस","मस्तिष्क सूजन","जापानी बुखार","दौरे बुखार","बेहोशी बुखार","मिर्गी बुखार","मस्तिष्क संक्रमण","दिमाग सूजन","एईएस","मस्तिष्क ज्वर बच्चा","मेंदू ताप","एन्सेफलायटीस","मेंदूचा संसर्ग","मेंदू सूज","जपानी ताप","झटके ताप","बेशुद्धी ताप","एईएस","आकडी ताप","मेंदूचा आजार","altered consciousness","high fever convulsions","febrile seizure","neurological fever","encephalopathy","cerebrits","बदली चेतना","उच्च बुखार दौरे","ज्वर आक्षेप","तंत्रिका तंत्र बुखार","एन्सेफेलोपैथी","बदललेली जाणीव","उच्च ताप झटके","ताप आकडी","चेतातंत्र ताप"]},{"id":"MEN","sno":9,"label":"Meningitis","kw":["meningitis","neck stiffness","meningococcal","brain membrane","spinal fever","cerebrospinal fever","neck rigidity","stiff neck fever","meningeal infection","headache stiff neck","neck pain fever","मैनिंजाइटिस","गर्दन अकड़न","दिमाग झिल्ली बुखार","मेनिंजाइटिस","गर्दन जकड़न","रीढ़ बुखार","गर्दन अकड़ बुखार","मस्तिष्क आवरण","सिर दर्द गर्दन अकड़न","मेनिंजायटीस","मान अकडणे","मेंदू आवरण ताप","मान जखडणे","पाठीचा कणा ताप","गळ्याची अकड","डोकेदुखी मान अकडणे","मेनिन्जेस संसर्ग","photophobia fever","light sensitivity fever","purpuric rash meningitis","petechiae fever","meningeal signs","प्रकाश संवेदनशीलता बुखार","पुरपुरा बुखार","मस्तिष्कावरणशोथ के लक्षण","प्रकाश संवेदनशीलता ताप","मेनिंजेसची चिन्हे","पुरपुरा ताप"]},{"id":"MES","sno":10,"label":"Measles","kw":["measles","rubeola","red rash","skin rash fever","spots fever","rash fever","morbilli","red spots","measles rash","whole body rash","measles virus","koplik spots","fever rash","khasra","खसरा","मीजल्स","लाल दाने","दाने बुखार","खसरा बुखार","चकत्ते","त्वचा दाने","लाल धब्बे","पूरे शरीर पर दाने","रुबेओला","खुजली दाने बुखार","खसरे के दाने","गोवर","गोवर ताप","लाल पुरळ","अंगावर पुरळ","दाणे ताप","खसरा","मीझल्स","पुरळ ताप","लाल ठिपके","संपूर्ण अंग पुरळ","गोवर विषाणू","maculopapular rash","koplik spots","measles pneumonia","measles complication","post measles","मेकुलोपापुलर दाने","कॉपलिक धब्बे","खसरा निमोनिया","खसरा जटिलता","मेक्युलोपेप्युलर पुरळ","कॉपलिक ठिपके","गोवर न्यूमोनिया"]},{"id":"DIP","sno":11,"label":"Diphtheria","kw":["diphtheria","diptheria","throat membrane","false membrane","corynebacterium","bull neck","throat patch","throat coating","white patch throat","throat film","डिफ्थीरिया","गले की झिल्ली","गले में सफेद परत","गले की बीमारी","सफेद झिल्ली गले","गला बंद","गले में सफेद धब्बा","गले का संक्रमण झिल्ली","रोहिणी","घटसर्प","घशाचा पडदा","घशात पांढरा पडदा","डिप्थीरिया","घसा आजार","घशात पांढरी जाळी","घसा बंद","घटसर्प रोग","घशाची जाळी","throat pseudomembrane","barking cough diphtheria","toxigenic corynebacterium","myocarditis diphtheria","गले की झूठी झिल्ली","भौंकने वाली खांसी","हृदय शोथ डिफ्थीरिया","घशाचा खोटा पडदा","भुंकणारा खोकला","हृदय सूज घटसर्प"]},{"id":"PER","sno":12,"label":"Pertussis","kw":["pertussis","whooping cough","whooping","100 days cough","severe cough","paroxysmal cough","cough whoop","bordetella","spasmodic cough","fit of cough","whoop cough","काली खांसी","कुकुर खांसी","पर्टुसिस","सौ दिन की खांसी","उग्र खांसी","दौरे वाली खांसी","बोर्डेटेला","खांसी के दौरे","काली कास","डांग्या खोकला","काळी खोकला","पर्टुसिस","शंभर दिवसांचा खोकला","उग्र खोकला","खोकल्याचे झटके","बोर्डेटेला","काळखोकला","डांग्या","post-tussive vomiting","inspiratory whoop","catarrhal stage cough","paroxysmal stage","convalescent cough","खांसी के बाद उल्टी","श्वसन भंवर","खांसी अवस्था","स्वास्थ्य लाभ खांसी","खोकल्यानंतर उलटी","श्वसन आवाज खोकला","खोकल्याची अवस्था"]},{"id":"CPX","sno":13,"label":"Chicken Pox","kw":["chicken pox","chickenpox","varicella","pox","blisters","water blisters","blister rash","itchy blisters","pox fever","vesicular rash","varicella zoster","itchy rash blisters","chechak","चिकनपॉक्स","चेचक","छोटी माता","वेरिसेला","पानी भरे दाने","खुजली दाने","माता निकलना","छाले दाने","चिकन पॉक्स बुखार","माता आना","कांजण्या","कांजिण्या","चिकनपॉक्स","व्हेरिसेला","फोड","पाणी भरलेले फोड","खाज येणारे दाणे","माता येणे","छोटी देवी","खाज पुरळ","कांजण्या येणे","varicella infection","shingles","zoster","herpes zoster","chicken pox rash","pox blister","vesicle rash","वेरिसेला संक्रमण","शिंगल्स","दाद","हर्पीस जोस्टर","छाले दाने","वेसिकल","व्हेरिसेला संसर्ग","झोस्टर","हर्पीस झोस्टर","फोड पुरळ","पाणी फोड"]},{"id":"PUO","sno":14,"label":"Fever of Unknown Origin (PUO)","kw":["fever","puo","unknown fever","undiagnosed fever","high fever","fever unknown origin","simple fever","mild fever","persistent fever","prolonged fever","low grade fever","undifferentiated fever","general fever","febrile illness","pyrexia","body hot","बुखार","तेज बुखार","अज्ञात बुखार","पीयूओ","बुखार आना","साधारण बुखार","लंबा बुखार","हल्का बुखार","निम्न श्रेणी बुखार","ज्वर","ताप","बुखार रहना","बुखार कारण नहीं","अज्ञात ज्वर","तापमान बढ़ना","ताप","अज्ञात ताप","पीयूओ","साधा ताप","सतत ताप","उच्च ताप","सौम्य ताप","दीर्घकालीन ताप","ताप येणे","ताप उतरत नाही","ज्वर","अंग गरम होणे","undulant fever","relapsing fever","biphasic fever","fever nausea","feverish","temperature elevation","thermometer high","body heat","running temperature","आंत की गर्मी","ज्वरग्रस्त","बुखार मिचली","तापमान बढ़ना","बुखार उल्टी","शरीर गर्म","थर्मामीटर ऊंचा","ताप ठंड","ताप मळमळ","तापमान वाढणे","शरीर गरम होणे","थर्मामीटर जास्त","ताप उलट्या","अंग गरम"]},{"id":"ARI","sno":15,"label":"Acute Respiratory Infection (ARI) / Influenza Like Illness (ILI)","kw":["cough","cold","flu","influenza","ili","ari","respiratory infection","sore throat","throat infection","runny nose","sneezing","rhinitis","common cold","upper respiratory","nasal congestion","throat pain","flu like","cough cold","ari case","cough fever","खांसी","जुकाम","सर्दी","फ्लू","इन्फ्लुएंजा","गले में दर्द","बहती नाक","छींक","श्वसन संक्रमण","नाक बंद","गले में खराश","सर्दी खांसी","एआरआई","आईएलआई","नजला","खांसी जुकाम","खोकला","सर्दी","फ्लू","इन्फ्लुएंझा","घसा दुखणे","नाक वाहणे","शिंका येणे","श्वसन संसर्ग","नाक चोंदणे","घसा खराब","एआरआय","आयएलआय","खोकला सर्दी ताप","नाक गळणे","acute bronchitis","tracheitis","laryngitis","nasopharyngitis","pharyngitis","tonsillitis","otitis media","ear infection","nasal discharge","blocked nose","post nasal drip","तीव्र ब्रोंकाइटिस","ग्रसनीशोथ","टॉन्सिलाइटिस","कान का संक्रमण","नाक का बहाव","बंद नाक","खांसी बुखार जुकाम","तीव्र ब्रॉंकायटिस","घसा सूज","टॉन्सिलायटिस","कानाचा संसर्ग","नाकाचा स्राव","बंद नाक","खोकला सर्दी ताप"]},{"id":"PNE","sno":16,"label":"Pneumonia","kw":["pneumonia","chest infection","lung infection","breathing difficulty","breathless","chest pain fever","lung inflammation","lower respiratory","pneumonitis","pulmonary infection","difficulty breathing","labored breathing","chest congestion fever","lungs","निमोनिया","फेफड़ों का संक्रमण","छाती में संक्रमण","सांस लेने में तकलीफ","फेफड़े की सूजन","छाती का दर्द बुखार","श्वास कठिनाई","साँस फूलना","छाती की बीमारी","फेफड़े बुखार","छाती जकड़न","न्यूमोनिया","फुफ्फुसाचा संसर्ग","छातीचा संसर्ग","श्वास घेण्यास त्रास","फुफ्फुस सूज","छाती दुखणे ताप","श्वास कठीण","छातीचा आजार","दम लागणे","फुफ्फुस ताप","छाती जड होणे","lobar pneumonia","bilateral pneumonia","aspiration pneumonia","walking pneumonia","atypical pneumonia","crackling breath","wheeze chest","लोबर निमोनिया","द्विपक्षीय निमोनिया","चलते फिरते निमोनिया","असामान्य निमोनिया","छाती में सांय","लोबर न्यूमोनिया","दोन्ही बाजू न्यूमोनिया","चालता न्यूमोनिया","छातीत घोंगावणे"]},{"id":"LEP","sno":17,"label":"Leptospirosis","kw":["leptospirosis","lepto","rat fever","rat urine fever","weil disease","leptospira","flood fever","muddy water fever","well disease","spirochetal fever","लेप्टोस्पायरोसिस","चूहा बुखार","चूहे का पेशाब बुखार","बाढ़ बुखार","वेइल रोग","लेप्टोस्पाइरा","गंदे पानी बुखार","चूहा संक्रमण","बाढ़ के बाद बुखार","लेप्टोस्पायरोसिस","उंदीर ताप","वेइल रोग","पूर ताप","चिखल ताप","उंदराच्या मूत्र ताप","लेप्टोस्पायरा","गढूळ पाणी ताप","पुरानंतर ताप","leptospira icterohaemorrhagiae","mud fever","harvest fever","field fever","canicola fever","post flood fever","jaundice fever leptospira","मड फीवर","फसल बुखार","खेत बुखार","बाढ़ के बाद पीलिया बुखार","गंदा पानी पीलिया","चिखल ताप","शेत ताप","पूरानंतर पिवळा ताप","गढूळ पाणी पिवळा ताप"]},{"id":"AFP","sno":18,"label":"Acute Flaccid Paralysis (<15 Years of Age)","kw":["paralysis","afp","flaccid paralysis","limb weakness","polio","lame","weakness limb child","sudden weakness","acute paralysis","leg weakness child","arm weakness","drooping limb","limp limb","child paralysis","लकवा","एएफपी","तीव्र शिथिल पक्षाघात","अंग कमजोरी","पोलियो","लंगड़ापन","बच्चे का लकवा","अचानक कमजोरी","हाथ पैर कमजोर","पक्षाघात बच्चे","अंग लटकना","लकवा मारना","अर्धांगवायू","एएफपी","पाय कमकुवत","पोलिओ","लंगडणे","अचानक अशक्तपणा","मुलांचा अर्धांगवायू","हात पाय कमकुवत","अंग लटकणे","मुलाला लकवा","acute onset paralysis","sudden paralysis child","one sided weakness child","foot drop","wrist drop","polio like","post infectious paralysis","अचानक लकवा बच्चा","एकतरफा कमजोरी","पांव गिरना","कलाई गिरना","पोलियो जैसा","संक्रमण बाद लकवा","अचानक अर्धांगवायू मूल","एका बाजूचा अशक्तपणा","पाय खाली पडणे","पोलिओसारखा","संसर्गानंतर अर्धांगवायू"]},{"id":"DOG","sno":19,"label":"Dog bite","kw":["dog bite","dog attack","bitten by dog","dog scratch","canine bite","rabies exposure","dog bite wound","stray dog bite","mad dog bite","dog bite case","animal bite dog","dog wound","कुत्ते का काटना","कुत्ता काटा","कुत्ते ने काटा","कुत्ता हमला","पागल कुत्ता","रेबीज","कुत्ता खरोंच","आवारा कुत्ता काटना","कुत्ता काटना","कुत्ते का घाव","कुत्ता दंश","कुत्रा चावणे","कुत्र्याने चावणे","कुत्रा हल्ला","वेडा कुत्रा","रेबीज","कुत्रा ओरखडणे","भटक्या कुत्र्याचा चावा","श्वान दंश","कुत्र्याची जखम","कुत्रा काटणे","anti rabies","arf","post exposure prophylaxis","pep treatment","dog scratch","cat bite","cat scratch","monkey bite","animal attack","रेबीज रोधी","एआरएफ","पीईपी इलाज","कुत्ता खरोंच","बिल्ली काटना","बंदर काटना","जानवर हमला","कुत्ते की लार","रेबीज विरोधी","पीईपी उपचार","मांजर चावणे","माकड चावणे","प्राणी हल्ला","कुत्रा खरोचणे"]},{"id":"SNK","sno":20,"label":"Snake bite","kw":["snake bite","snakebite","bitten by snake","serpent bite","viper bite","cobra bite","snake attack","venomous snake","snake wound","krait bite","snake envenomation","snake sting","सांप काटना","सर्प दंश","सांप ने काटा","सांप का काटना","विषैला सांप","कोबरा काटना","करैत काटना","सांप काटने का घाव","सर्प विष","साँप का जहर","सांपने काटा","साप चावणे","सर्पदंश","सापाने चावणे","विषारी साप","कोब्रा चावणे","करैत चावणे","सापाची जखम","साप विष","सर्प दंश होणे","सापाने चाव घेणे","hemotoxic snake","neurotoxic snake","pit viper","russell viper","saw scaled viper","krait envenomation","cobra envenomation","anti snake venom","asv","हेमोटॉक्सिक सांप","न्यूरोटॉक्सिक सांप","रसेल वाइपर","करैत जहर","कोबरा जहर","एंटी स्नेक वेनम","सांप जहर उपचार","हेमोटॉक्सिक साप","न्यूरोटॉक्सिक साप","रसेल व्हायपर","करैत विष","कोब्रा विष","अँटी स्नेक व्हेनम"]},{"id":"OSD","sno":21,"label":"Any other State Specific Disease (Specify)","kw":["state specific disease","regional disease","local disease","endemic disease","scrub typhus","kfd","regional fever","local fever","area specific disease","राज्य विशेष रोग","क्षेत्रीय रोग","स्थानीय रोग","स्क्रब टाइफस","स्थानिक बुखार","प्रदेश रोग","इलाका विशेष रोग","राज्य विशेष रोग","प्रादेशिक रोग","स्थानिक आजार","स्क्रब टायफस","स्थानिक ताप","प्रदेशीय रोग","क्षेत्रीय आजार","kyasanur forest disease","crimean congo fever","nipah","scrub typhus","murine typhus","rickettsial","ehrlichiosis","lyme disease","क्यासानूर वन रोग","क्रीमियन कांगो बुखार","निपाह","स्क्रब टाइफस","म्यूरिन टाइफस","रिकेट्सियल","क्यासानूर वन रोग","क्रिमियन काँगो ताप","निपाह","स्क्रब टायफस","रिकेट्शियल"]},{"id":"UNS","sno":22,"label":"Unusual Syndromes NOT Captured Above","kw":["unusual syndrome","unknown syndrome","unspecified illness","other illness","misc illness","strange disease","cluster illness","unusual cluster","atypical presentation","novel illness","unexplained illness","other","unknown","अज्ञात सिंड्रोम","अज्ञात बीमारी","अन्य बीमारी","असामान्य बीमारी","विचित्र बीमारी","अस्पष्ट बीमारी","विभिन्न बीमारी","अनजान रोग","अन्य रोग","अज्ञात सिंड्रोम","अज्ञात आजार","इतर आजार","असामान्य आजार","विचित्र रोग","अस्पष्ट रोग","नवीन आजार","अनोळखी रोग","इतर रोग","hemorrhagic fever","unidentified fever cluster","mass illness","outbreak unknown","mass casualty","unexplained deaths","unexplained symptoms","novel pathogen","रक्तस्रावी बुखार","अज्ञात बुखार समूह","सामूहिक बीमारी","अज्ञात प्रकोप","अस्पष्ट मृत्यु","नई बीमारी","रक्तस्रावी ताप","अज्ञात ताप गट","सामूहिक आजार","अज्ञात साथ","नवीन रोग"]}];

const FORM_P_DISEASES = DISEASE_DICT.map(d => ({ id: d.id, sno: d.sno, label: d.label, keywords: d.kw }));

const WORD_NUMBERS = {
  one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
  eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,
  seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,
  fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,
  ek:1,do:2,teen:3,char:4,paanch:5,chhe:6,saat:7,aath:8,nau:9,das:10,
};
function wordToNum(s) {
  if (WORD_NUMBERS[s]) return WORD_NUMBERS[s];
  const p = s.split(/\s+/);
  if (p.length===2 && WORD_NUMBERS[p[0]] && WORD_NUMBERS[p[1]]) return WORD_NUMBERS[p[0]]+WORD_NUMBERS[p[1]];
  return null;
}

function localParse(text) {
  const lower = text
    .replace(/[–—]/g,"-")
    .replace(/approx\.?|around|about|nearly|roughly|approximately/gi,"")
    .replace(/cases? of|patients? (?:with|of)|people (?:with|had|have)/gi,"")
    .replace(/reported|found|seen|total|were|has|had|showing|complaining|suffering|affected/gi,"")
    .replace(/\band\b/gi,",")
    .toLowerCase();
  const segments = lower.split(/[,;\n]+|\balso\b|\bplus\b|\bthen\b|\baur\b|\baani\b/).map(s=>s.trim()).filter(s=>s.length>1);
  const results = [];
  for (const seg of segments) {
    const clean = seg.replace(/^[\w\u0900-\u097F\s]+[:\-]\s*/,"").trim();
    if (!clean) continue;
    let count = null;
    const dm = clean.match(/\b(\d+)\b/);
    if (dm) count = parseInt(dm[1],10);
    else {
      const tokens = clean.split(/\s+/);
      for (let i=0;i<tokens.length;i++){
        const n=wordToNum(tokens[i]);if(n){count=n;break;}
        if(i+1<tokens.length){const n2=wordToNum(tokens[i]+" "+tokens[i+1]);if(n2){count=n2;break;}}
      }
      if (!count) count = 1;
    }
    if (count<=0) continue;
    let best=null, bestScore=0;
    for (const d of DISEASE_DICT) {
      for (const kw of d.kw) {
        if (kw.length > bestScore && clean.includes(kw)) { bestScore = kw.length; best = d; }
      }
    }
    if (best) {
      const existing = results.find(r=>r.id===best.id);
      if (existing) existing.count += count;
      else results.push({ id:best.id, sno:best.sno, label:best.label, count });
    }
  }
  return results;
}

function getWeekRange(offset=0){
  const today=new Date(),day=today.getDay();
  const monday=new Date(today);
  monday.setDate(today.getDate()-((day+6)%7)+offset*7);
  const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);
  const fmt=d=>d.toISOString().split("T")[0];
  return {start:fmt(monday),end:fmt(sunday)};
}
function prettyDate(iso){ if(!iso) return ""; return new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
function fmtDateSlash(iso){
  if(!iso) return "__/__/____";
  const d=new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

async function generateFormPDF({ unit, state, district, block, idNo, officerName, reportedBy, weekStart, weekEnd, formRows }) {
  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210, ML = 15, MR = 15, MT = 15;
  const CW = PW - ML - MR;
  const setFont = (size, style="normal") => doc.setFontSize(size).setFont("helvetica", style);
  const line = (x1,y1,x2,y2,w=0.3) => { doc.setLineWidth(w); doc.line(x1,y1,x2,y2); };
  const rect = (x,y,w,h,lw=0.3) => { doc.setLineWidth(lw); doc.rect(x,y,w,h); };
  const text = (t,x,y,opts={}) => doc.text(String(t),x,y,opts);
  let y = MT;
  setFont(13,"bold"); text("FORM P",PW/2,y,{align:"center"}); y+=6;
  setFont(11,"bold");
  const t2 = "(Weekly Reporting Format \u2013IDSP)";
  text(t2, PW/2, y, {align:"center"});
  const t2w = doc.getTextWidth(t2);
  doc.line(PW/2-t2w/2, y+0.5, PW/2+t2w/2, y+0.5);
  y += 8;
  const BOX_X = ML, BOX_W = CW, ROW_H = 8;
  rect(BOX_X, y, BOX_W, ROW_H);
  const col1W = BOX_W * 0.62;
  line(BOX_X+col1W, y, BOX_X+col1W, y+ROW_H);
  setFont(8,"bold"); text("Name of Reporting Institution:", BOX_X+2, y+5.5);
  setFont(8,"normal"); text(unit||"", BOX_X+62, y+5.5);
  setFont(8,"bold"); text("I.D. No.:", BOX_X+col1W+2, y+5.5);
  setFont(8,"normal"); text(idNo||"", BOX_X+col1W+22, y+5.5);
  y += ROW_H;
  rect(BOX_X, y, BOX_W, ROW_H);
  const c2a = BOX_W*0.28, c2b = BOX_W*0.28;
  line(BOX_X+c2a, y, BOX_X+c2a, y+ROW_H); line(BOX_X+c2a+c2b, y, BOX_X+c2a+c2b, y+ROW_H);
  setFont(8,"bold"); text("State:", BOX_X+2, y+5.5); setFont(8,"normal"); text(state||"", BOX_X+14, y+5.5);
  setFont(8,"bold"); text("District:", BOX_X+c2a+2, y+5.5); setFont(8,"normal"); text(district||"", BOX_X+c2a+18, y+5.5);
  setFont(8,"bold"); text("Block/Town/City:", BOX_X+c2a+c2b+2, y+5.5); setFont(8,"normal"); text(block||"", BOX_X+c2a+c2b+34, y+5.5);
  y += ROW_H;
  rect(BOX_X, y, BOX_W, ROW_H);
  const c3a = BOX_W*0.28, c3b = BOX_W*0.36;
  line(BOX_X+c3a, y, BOX_X+c3a, y+ROW_H); line(BOX_X+c3a+c3b, y, BOX_X+c3a+c3b, y+ROW_H);
  setFont(8,"bold"); text("Officer-in-Charge", BOX_X+2, y+5.5);
  setFont(8,"bold"); text("Name:", BOX_X+c3a+2, y+5.5); setFont(8,"normal"); text(officerName||"", BOX_X+c3a+14, y+5.5);
  setFont(8,"bold"); text("Signature:", BOX_X+c3a+c3b+2, y+5.5);
  y += ROW_H;
  const dateRowH = 16;
  rect(BOX_X, y, BOX_W, dateRowH);
  const c4a=BOX_W*0.25, c4b=BOX_W*0.25, c4c=BOX_W*0.25;
  line(BOX_X+c4a,y,BOX_X+c4a,y+dateRowH); line(BOX_X+c4a+c4b,y,BOX_X+c4a+c4b,y+dateRowH); line(BOX_X+c4a+c4b+c4c,y,BOX_X+c4a+c4b+c4c,y+dateRowH);
  setFont(8,"bold");
  text("IDSP Reporting Week:-", BOX_X+2, y+5); text("Start Date:-", BOX_X+c4a+2, y+5);
  text("End Date:-", BOX_X+c4a+c4b+2, y+5); text("Date of", BOX_X+c4a+c4b+c4c+2, y+5); text("Reporting:-", BOX_X+c4a+c4b+c4c+2, y+9.5);
  setFont(8,"normal");
  text(fmtDateSlash(weekStart), BOX_X+c4a+6, y+13); text(fmtDateSlash(weekEnd), BOX_X+c4a+c4b+4, y+13);
  text(fmtDateSlash(new Date().toISOString().split("T")[0]), BOX_X+c4a+c4b+c4c+4, y+13);
  y += dateRowH + 4;
  const TH=8, DR_H=9, SNW=12, CSW=28, DISW=CW-SNW-CSW;
  rect(BOX_X, y, CW, TH, 0.5);
  line(BOX_X+SNW, y, BOX_X+SNW, y+TH); line(BOX_X+SNW+DISW, y, BOX_X+SNW+DISW, y+TH);
  setFont(8.5,"bold");
  text("S.no", BOX_X+SNW/2, y+5.2, {align:"center"});
  text("Diseases/Syndromes", BOX_X+SNW+DISW/2, y+5.2, {align:"center"});
  text("No. of cases", BOX_X+SNW+DISW+CSW/2, y+5.2, {align:"center"});
  y += TH;

  // Only render detected diseases — no blank rows
  const detectedRows = formRows.filter(r => r.count > 0);
  for (let i = 0; i < detectedRows.length; i++) {
    const row = detectedRows[i];
    rect(BOX_X, y, CW, DR_H);
    line(BOX_X+SNW, y, BOX_X+SNW, y+DR_H);
    line(BOX_X+SNW+DISW, y, BOX_X+SNW+DISW, y+DR_H);
    setFont(8, "bold");
    text(String(i + 1), BOX_X+SNW/2, y+DR_H/2+1.5, {align:"center"});
    setFont(8, "normal");
    const nameLines = doc.splitTextToSize(row.label, DISW-4);
    nameLines.forEach((ln, li) => text(ln, BOX_X+SNW+2, y+DR_H/2+1.5+(li-(nameLines.length-1)/2)*4));
    setFont(10, "bold");
    doc.setTextColor(20, 100, 40);
    text(String(row.count), BOX_X+SNW+DISW+CSW/2, y+DR_H/2+1.5, {align:"center"});
    doc.setTextColor(0, 0, 0);
    y += DR_H;
  }
  const extraRows = ["Total New OPD attendance (Not to be filled up when data collected for indoor cases)","Action taken in brief if unusual increase noticed in cases/deaths for any of the above diseases"];
  for (const label of extraRows) {
    const lines = doc.splitTextToSize(label, DISW-4);
    const rowH = Math.max(9, lines.length * 5.5 + 3);
    rect(BOX_X, y, CW, rowH); line(BOX_X+SNW, y, BOX_X+SNW, y+rowH); line(BOX_X+SNW+DISW, y, BOX_X+SNW+DISW, y+rowH);
    setFont(8,"normal"); lines.forEach((ln,li) => text(ln, BOX_X+SNW+2, y+5+li*5));
    y += rowH;
  }
  y += 10; setFont(8,"normal"); doc.setTextColor(120,120,120);
  text(`Generated by Arogya Kavach ASHA Reporting Portal  |  ${new Date().toLocaleString("en-IN")}`, ML, y);
  if (reportedBy) text(`Reported by: ${reportedBy}`, ML, y+5);
  doc.save(`IDSP_FormP_${district||unit||"report"}_${weekStart||"week"}.pdf`);
}

const cn = (...a) => a.filter(Boolean).join(" ");

function GlassCard({ children, className }) {
  return (
    <div className={cn("rounded-[22px] bg-white/75 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.07] backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}

function StepBadge({ n, active, done }) {
  return (
    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 transition-all duration-300",
      done?"bg-emerald-500 text-white":active?"bg-black text-white shadow-lg":"bg-black/8 text-black/35")}>
      {done ? <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : n}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[12px] font-bold uppercase tracking-wider text-black/45 mb-2">
      {children}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type="text", className }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      className={cn("w-full rounded-2xl bg-white px-5 py-3.5 text-[15px] text-black ring-1 ring-black/10 outline-none placeholder:text-black/30 transition focus:ring-2 focus:ring-black/20", className)} />
  );
}

export default function ASHAReportingPortal() {
  const [step, setStep] = useState(1);

  // Admin fields
  const [unit, setUnit]         = useState("");
  const [state, setState]       = useState("Maharashtra");
  const [district, setDistrict] = useState("");
  const [block, setBlock]       = useState("");
  const [idNo, setIdNo]         = useState("");
  const [officerName, setOfficerName] = useState("");
  const [reportedBy, setReportedBy]   = useState("");
  const weekRange = getWeekRange(0);
  const [weekStart, setWeekStart] = useState(weekRange.start);
  const [weekEnd, setWeekEnd]     = useState(weekRange.end);

  // ── OpenAI API Key (backend — replace with your actual key) ──
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // Report
  const [freeText, setFreeText]   = useState("");
  const [parsed, setParsed]       = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const [formRows, setFormRows]   = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const step1Done = unit && district && weekStart && weekEnd;
  const totalCases = formRows.reduce((s,r)=>s+r.count,0);

  // ── OpenAI gpt-4o-mini parse ──────────────────────────────────────────────
  async function handleParse() {
    if (!freeText.trim()) return;
    setIsParsing(true); setParseError("");
    try {
      const diseaseList = DISEASE_DICT.map(d=>`${d.id}(${d.sno}): ${d.label} — keywords: ${d.kw.slice(0,8).join(", ")}`).join("\n");

      const prompt = `You are an IDSP health surveillance expert. A field health worker has submitted a report. Extract disease case counts and map them to the official IDSP Form P disease list.

OFFICIAL IDSP FORM P DISEASES:
${diseaseList}

FIELD REPORT:
"${freeText}"

RULES:
- Understand ANY language: English, Hindi, Hinglish, local dialect, abbreviations, spelling mistakes
- Extract numeric counts — digits or written words (ten, twelve, paanch, das, etc.)
- If count is vague ("some", "few", "several", "kai") use 5 as estimate
- Map standard cases: bukhar/fever → PUO, piliya/jaundice → VH, dast/loose motion → ADD, kutta kata/dog bite → DOG, saanp/snake → SNK, khasi/cough/cold → ARI, rash/daane → MES, pox/blisters → CPX
- IMPORTANT: Only map to DOG bite if it is clearly a dog. Elephant bite, monkey bite, cat bite, or any other animal that is NOT a dog or snake → use UNS (Unusual Syndromes) and set the label to describe it exactly e.g. "Elephant bite"
- IMPORTANT: Do NOT force-map vague or unclear symptoms to a disease. If unsure, use UNS with a descriptive label
- If multiple unusual/unspecified items exist, combine them into one UNS entry with the highest count, or list separately if counts differ
- DO NOT invent diseases not mentioned
- Return ONLY a valid JSON array, no explanation, no markdown backticks

JSON format:
[{"id":"ADD","sno":1,"label":"Acute Diarrhoeal Disease (including acute gastroenteritis)","count":3}, ...]`;

      // ── OpenAI Chat Completions API ──
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1000,
          temperature: 0,
          messages: [
            {
              role: "system",
              content: "You are a medical data extraction assistant. Always respond with only raw JSON arrays — no markdown, no explanation."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(()=>({}));
        throw new Error(errData?.error?.message || `OpenAI API error: ${res.status}`);
      }

      const data = await res.json();
      // OpenAI response shape: data.choices[0].message.content
      const raw = data.choices?.[0]?.message?.content || "[]";
      const clean = raw.replace(/```json|```/g,"").trim();
      const detected = JSON.parse(clean);
      const rows = detected.filter(d=>d.count>0).map(d=>({
        id:d.id, sno:d.sno, label:d.label||FORM_P_DISEASES.find(m=>m.id===d.id)?.label||d.id, count:d.count
      }));
      setParsed({results:rows});
      setFormRows(rows);
      setStep(3);
    } catch(err) {
      console.error(err);
      const msg = err.message || "Unknown error";
      setParseError(`AI analysis failed (${msg}) — using local keyword parser as fallback.`);
      const rows = localParse(freeText);
      setParsed({results:rows});
      setFormRows(rows);
      setStep(3);
    } finally {
      setIsParsing(false);
    }
  }

  function updateCount(id, val) {
    const n = parseInt(val,10);
    setFormRows(prev=>prev.map(r=>r.id===id?{...r,count:isNaN(n)?0:Math.max(0,n)}:r));
  }

  async function handleDownload() {
    await generateFormPDF({unit,state,district,block,idNo,officerName,reportedBy,weekStart,weekEnd,formRows});
  }

  return (
    <div className="min-h-screen w-full text-black"
      style={{background:"radial-gradient(circle at 15% 10%,rgba(16,185,129,0.09),transparent 40%),radial-gradient(circle at 80% 20%,rgba(59,130,246,0.08),transparent 40%),linear-gradient(180deg,#f0fdf8 0%,#f6f7fb 100%)"}}>

      {/* Navbar */}
   <motion.header
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="sticky top-0 z-30 border-b border-black/8 bg-white/70 backdrop-blur-xl"
>
  <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
    <button
      type="button"
      onClick={() => {
        window.location.href = "/";
      }}
      className="flex items-center gap-3 text-left"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-black text-[28px] text-red-500 shadow-sm">
        ✚
      </div>
      <div>
        <div className="text-[16px] font-bold tracking-tight">Arogya Kavach</div>
        <div className="mt-0.5 text-[12px] leading-none text-black/45">
          ASHA Reporting Portal
        </div>
      </div>
    </button>

    <div className="flex items-center gap-2">
      <div className="rounded-full bg-emerald-50 px-4 py-1.5 text-[12.5px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
        IDSP Form P
      </div>
      <div className="rounded-full bg-black/5 px-4 py-1.5 text-[12.5px] font-medium text-black/55">
        Week{" "}
        {weekStart
          ? new Date(weekStart).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })
          : "—"}
      </div>
    </div>
  </div>
</motion.header>

      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
          <div className="text-[2.4rem] md:text-[2.8rem] font-bold tracking-tight leading-tight">Weekly Health Report</div>
          <div className="mt-2 text-[15px] text-black/50 max-w-xl">Write what you observed in plain language. AI will translate and auto-fill the official IDSP Form P.</div>
        </motion.div>

        {/* Step indicators */}
        <div className="mt-8 flex items-center gap-0">
          {[{n:1,label:"Admin Details"},{n:2,label:"Health Report"},{n:3,label:"Review & Submit"}].map((s,i)=>(
            <React.Fragment key={s.n}>
              <button onClick={()=>{if(s.n<step||(s.n===2&&step1Done))setStep(s.n);}} className="flex items-center gap-2.5">
                <StepBadge n={s.n} active={step===s.n} done={step>s.n}/>
                <span className={cn("text-[14px] font-semibold hidden sm:block transition-colors",step===s.n?"text-black":step>s.n?"text-emerald-600":"text-black/30")}>{s.label}</span>
              </button>
              {i<2&&<div className={cn("flex-1 h-px mx-4 transition-colors duration-500",step>s.n?"bg-emerald-400":"bg-black/10")}/>}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Admin + API Key ── */}
          {step===1&&(
            <motion.div key="s1" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.35}}>
              <GlassCard className="mt-6 p-8">
                <div className="flex items-center gap-4 mb-7">
                  <StepBadge n={1} active/>
                  <div>
                    <div className="text-[18px] font-bold">Administrative Details</div>
                    <div className="text-[13px] text-black/45 mt-0.5">Required for IDSP Form P compliance</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <FieldLabel required>Name of Reporting Institution / PHC</FieldLabel>
                    <Input value={unit} onChange={setUnit} placeholder="e.g. PHC Rampur"/>
                  </div>
                  <div>
                    <FieldLabel>I.D. No.</FieldLabel>
                    <Input value={idNo} onChange={setIdNo} placeholder="e.g. MH-PUB-0042"/>
                  </div>
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <Input value={state} onChange={setState} placeholder="e.g. Maharashtra"/>
                  </div>
                  <div>
                    <FieldLabel required>District</FieldLabel>
                    <Input value={district} onChange={setDistrict} placeholder="e.g. Pune"/>
                  </div>
                  <div>
                    <FieldLabel>Block / Town / City</FieldLabel>
                    <Input value={block} onChange={setBlock} placeholder="e.g. Haveli"/>
                  </div>
                  <div>
                    <FieldLabel>Officer-in-Charge Name</FieldLabel>
                    <Input value={officerName} onChange={setOfficerName} placeholder="e.g. Dr. Meena Patil"/>
                  </div>
                  <div>
                    <FieldLabel>ASHA / ANM Reporter Name</FieldLabel>
                    <Input value={reportedBy} onChange={setReportedBy} placeholder="e.g. Sunita Devi"/>
                  </div>
                  <div>
                    <FieldLabel required>Week Start Date</FieldLabel>
                    <Input type="date" value={weekStart} onChange={setWeekStart}/>
                  </div>
                  <div>
                    <FieldLabel required>Week End Date</FieldLabel>
                    <Input type="date" value={weekEnd} onChange={setWeekEnd}/>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2.5">
                  <span className="text-[12px] text-black/40 font-medium">Quick select:</span>
                  {[-1,0].map(offset=>{
                    const r=getWeekRange(offset);
                    const label=offset===0?"This week":"Last week";
                    const active=weekStart===r.start;
                    return(
                      <button key={offset} onClick={()=>{setWeekStart(r.start);setWeekEnd(r.end);}}
                        className={cn("rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition",active?"bg-black text-white":"bg-black/6 text-black/55 hover:bg-black/10")}>
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={()=>setStep(2)} disabled={!step1Done}
                    className={cn("rounded-2xl px-8 py-3.5 text-[15px] font-bold transition",step1Done?"bg-black text-white hover:opacity-85 shadow-sm":"bg-black/8 text-black/30 cursor-not-allowed")}>
                    Continue →
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── STEP 2: Free Text ── */}
          {step===2&&(
            <motion.div key="s2" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.35}}>
              <GlassCard className="mt-6 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <StepBadge n={2} active/>
                  <div>
                    <div className="text-[18px] font-bold">Write Your Health Report</div>                  </div>
                </div>

                <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-700 mb-2.5">Works with any style of writing</div>
                  <div className="space-y-2">
                    {[
                      `"Rampur mein is hafte: bukhar ke 12 case, khasi 7, dast 3, piliya 1, kutta kata 2"`,
                      `"seen about fifteen kids with rash, twelve with stomach problems, some fever"`,
                      `"fever-8, loose motion-4, jaundice-1, dog bite-2, cough & cold-6"`,
                    ].map((ex,i)=>(
                      <div key={i} className="text-[13px] text-emerald-800 font-mono leading-snug">{ex}</div>
                    ))}
                  </div>                </div>

                <div>
                  <FieldLabel required>Your Report (write freely)</FieldLabel>
                  <textarea value={freeText} onChange={e=>setFreeText(e.target.value)}
                    placeholder={"Write what you observed this week in any language...\n\nExamples:\n• \"8 fever, 3 diarrhea, 1 jaundice, 2 dog bite\"\n• \"bukhar 8, dast 3, piliya 1, kutta kata 2\"\n• \"around fifteen kids with cough, some rash cases, two dog bites\""}
                    rows={8}
                    className="w-full rounded-2xl bg-white px-5 py-4 text-[15px] text-black ring-1 ring-black/10 outline-none placeholder:text-black/25 transition focus:ring-2 focus:ring-black/20 resize-none leading-relaxed"/>

                </div>

                {parseError && (
                  <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-[12.5px] text-amber-700">{parseError}</div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <button onClick={()=>setStep(1)} className="text-[14px] font-semibold text-black/40 hover:text-black transition">← Back</button>
                  <button onClick={handleParse} disabled={!freeText.trim()||isParsing}
                    className={cn("flex items-center gap-2.5 rounded-2xl px-8 py-3.5 text-[15px] font-bold transition",freeText.trim()&&!isParsing?"bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm":"bg-black/8 text-black/30 cursor-not-allowed")}>
                    {isParsing?(
                      <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20"/></svg>Analysing…</>
                    ):"Analyse & Fill Form P →"}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── STEP 3: Review ── */}
          {step===3&&!submitted&&(
            <motion.div key="s3" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.35}}>

              <div className="mt-6 rounded-2xl bg-emerald-600 px-6 py-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-100">Analysed your report</div>
                  <div className="text-[15px] font-semibold text-white mt-0.5">
                    {formRows.length} disease{formRows.length!==1?"s":""} detected · {totalCases} total cases
                  </div>
                </div>
                <button onClick={()=>{setParsed(null);setStep(2);}}
                  className="rounded-xl bg-emerald-700/60 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700 transition">
                  ← Edit Report
                </button>
              </div>

              <GlassCard className="mt-3 overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-black/6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-black/40">FORM P — Weekly Reporting Format (IDSP)</div>
                      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4 text-[13px]">
                        <div><span className="text-black/40">Institution: </span><span className="font-semibold">{unit}</span></div>
                        <div><span className="text-black/40">District: </span><span className="font-semibold">{district}</span></div>
                        <div><span className="text-black/40">From: </span><span className="font-semibold">{prettyDate(weekStart)}</span></div>
                        <div><span className="text-black/40">To: </span><span className="font-semibold">{prettyDate(weekEnd)}</span></div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-[11px] text-black/35 italic text-right">Counts are editable</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="bg-black/[0.03] border-b border-black/8">
                        <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-black/45 w-14">S.No</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-black/45">Disease / Syndrome (as detected)</th>
                        <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-black/45 w-36">No. of Cases</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formRows.filter(r=>r.count>0).map((row, idx)=>(
                        <tr key={row.id+idx} className="border-b border-black/[0.04] bg-emerald-50/50">
                          <td className="px-4 py-3 text-center text-[13px] font-bold text-black/40">{row.sno}</td>
                          <td className="px-4 py-3 text-[13.5px] font-medium text-black leading-snug">{row.label}</td>
                          <td className="px-4 py-2.5">
                            <input type="number" min="0" value={row.count||""} onChange={e=>updateCount(row.id,e.target.value)}
                              className="w-full rounded-xl bg-emerald-100 px-3 py-2 text-center text-[15px] font-black text-emerald-800 outline-none ring-1 ring-emerald-300 focus:ring-emerald-500 transition"/>
                          </td>
                          <td className="px-2 py-2.5">
                            <button onClick={()=>setFormRows(prev=>prev.filter(r=>!(r.id===row.id)))}
                              className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition text-lg font-bold">×</button>
                          </td>
                        </tr>
                      ))}
                      {formRows.filter(r=>r.count>0).length===0&&(
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-[13px] text-black/35">No diseases detected yet. Add one below.</td></tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-black/[0.05] border-t-2 border-black/12">
                        <td colSpan={2} className="px-4 py-4 text-[15px] font-black text-black">TOTAL CASES</td>
                        <td className="px-4 py-4 text-center text-[20px] font-black text-black">{totalCases}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Add a disease manually */}
                <div className="px-6 py-4 border-t border-black/6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-black/35 mb-3">Add a disease manually</div>
                  <div className="relative">
                    <select onChange={e=>{
                      const d=FORM_P_DISEASES.find(x=>x.id===e.target.value);
                      if(d&&!formRows.find(r=>r.id===d.id)){setFormRows(prev=>[...prev,{...d,count:1}]);}
                      e.target.value="";
                    }} defaultValue=""
                      className="w-full appearance-none rounded-2xl bg-white px-5 py-3.5 text-[14px] text-black ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/20 cursor-pointer pr-10 transition">
                      <option value="" disabled>Select disease to add…</option>
                      {FORM_P_DISEASES.filter(d=>!formRows.find(r=>r.id===d.id)).map(d=>(
                        <option key={d.id} value={d.id}>{d.sno}. {d.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {reportedBy&&(
                  <div className="px-6 py-3.5 border-t border-black/6 text-[13px] text-black/50">
                    Reported by: <span className="font-semibold text-black">{reportedBy}</span>
                  </div>
                )}
              </GlassCard>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <button onClick={handleDownload}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-black/6 px-6 py-3.5 text-[14px] font-semibold text-black hover:bg-black/10 transition ring-1 ring-black/8">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v13M7 12l5 5 5-5M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Download Official Form P (PDF)
                </button>
                <button onClick={()=>setSubmitted(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-[15px] font-bold text-white hover:bg-emerald-700 transition shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Submit Report
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {submitted&&(
            <motion.div key="done" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{duration:0.4}}>
              <GlassCard className="mt-6 p-12 flex flex-col items-center text-center">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.1,type:"spring",stiffness:200}}
                  className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg mb-6">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M4 13l5 5L20 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.div>
                <div className="text-[2rem] font-black tracking-tight">Report Submitted!</div>
                <div className="mt-2.5 text-[14px] text-black/50 max-w-md">
                  IDSP Form P for <strong>{district}</strong> ({prettyDate(weekStart)} – {prettyDate(weekEnd)}) submitted with <strong>{totalCases} total cases</strong>.
                </div>
                <div className="mt-7 rounded-2xl bg-black/4 px-7 py-5 text-left text-[13.5px] space-y-2 w-full max-w-sm">
                  {formRows.filter(r=>r.count>0).map(r=>(
                    <div key={r.id} className="flex justify-between">
                      <span className="text-black/60">{r.label}</span>
                      <span className="font-bold">{r.count}</span>
                    </div>
                  ))}
                  <div className="border-t border-black/10 pt-2 flex justify-between font-black text-[15px]">
                    <span>Total</span><span>{totalCases}</span>
                  </div>
                </div>
                <div className="mt-7 flex gap-3">
                  <button onClick={handleDownload} className="rounded-2xl bg-black/6 px-6 py-3 text-[13.5px] font-semibold text-black hover:bg-black/10 transition">
                    Download PDF
                  </button>
                  <button onClick={()=>{setStep(1);setParsed(null);setFreeText("");setFormRows([]);setSubmitted(false);setUnit("");setDistrict("");setBlock("");setIdNo("");setOfficerName("");setReportedBy("");}}
                    className="rounded-2xl bg-emerald-600 px-6 py-3 text-[13.5px] font-bold text-white hover:bg-emerald-700 transition">
                    New Report
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center text-[12px] text-black/30">
          Arogya Kavach · ASHA Reporting Portal · IDSP Compliant 
        </div>
      </div>
    </div>
  );
}