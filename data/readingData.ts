import { ReadingPassage, QuestionType } from '../types';

export const readingPassageData: ReadingPassage[] = [
  {
    id: 'Language Learning',
    title: 'Benefits of Learning a Second Language',
    difficulty: 6.5,
    passage: `
      <p class="mb-4">In an increasingly interconnected world, the ability to speak more than one language is a highly valuable skill. Bilingualism, or multilingualism, offers a wealth of benefits that go far beyond simple communication. Studies have shown that learning a second language can have a profound positive effect on the brain. It can improve cognitive functions such as problem-solving, multitasking, and memory. When you learn a new language, you are essentially giving your brain a workout, creating new neural pathways and making it more flexible and resilient.</p>
      <p class="mb-4">One of the most significant cognitive advantages is the enhancement of executive functions. These are the skills that allow you to control, direct, and manage your attention, as well as plan and prioritise tasks. Bilingual individuals often outperform their monolingual counterparts in tasks that require these skills. Furthermore, research suggests that being bilingual can delay the onset of age-related cognitive decline, including conditions like Alzheimer's disease, by several years.</p>
      <p class="mb-4">Beyond the brain, knowing another language opens up a world of cultural and social opportunities. It allows you to connect with a wider range of people, understand different perspectives, and appreciate the richness of other cultures through their literature, films, and music. This can lead to a more profound sense of empathy and a broader worldview. For young people, it can also significantly improve career prospects, as many employers in the global marketplace seek candidates with language skills.</p>
      <p>While the process of learning a new language requires dedication and effort, the rewards are immense and long-lasting. It is an investment in yourself that pays dividends in cognitive health, cultural understanding, and personal growth. The idea that language learning is only for the very young has been proven to be a myth; anyone can embark on this rewarding journey at any age.</p>
    `,
    questions: [
      {
        id: 1,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "1. Learning a new language only improves communication skills.",
        correctAnswer: "False",
        explanation: "The passage states that language learning offers benefits that go 'far beyond simple communication,' including improved cognitive functions. Therefore, the statement is false."
      },
      {
        id: 2,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "2. Bilingual people are often better at managing their attention.",
        correctAnswer: "True",
        explanation: "The text says executive functions include the ability to 'manage your attention' and that 'Bilingual individuals often outperform their monolingual counterparts in tasks that require these skills.' Therefore, the statement is true."
      },
      {
        id: 3,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "3. Knowing a second language guarantees a higher salary.",
        correctAnswer: "Not Given",
        explanation: "The passage mentions that language skills can 'significantly improve career prospects,' but it does not specifically state that it guarantees a higher salary. Therefore, the information is not given."
      },
      {
        id: 4,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "4. Learning a language can help protect the brain against aging.",
        correctAnswer: "True",
        explanation: "The text suggests that being bilingual 'can delay the onset of age-related cognitive decline, including conditions like Alzheimer's disease.' This supports the statement. Therefore, it is true."
      },
       {
        id: 5,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "5. Only children can learn a new language effectively.",
        correctAnswer: "False",
        explanation: "The passage explicitly calls this idea a 'myth' and states, 'anyone can embark on this rewarding journey at any age.' Therefore, the statement is false."
      },
    ],
  },
  {
    id: 'Ao Dai',
    title: 'The Ao Dai: Vietnam\'s National Dress',
    difficulty: 6.0,
    passage: `
      <p class="mb-4">The Ao Dai, the traditional long garment of Vietnam, is more than just a piece of clothing; it is a symbol of national pride, elegance, and cultural identity. Its history is long and complex, with origins that can be traced back centuries. Early versions of the Ao Dai were much looser and less fitted than the modern design. It was during the 1930s, under the influence of French fashion, that a Saigon-based designer named Cat Tuong, or 'Le Mur', redesigned the garment to be the sleek, form-fitting tunic over wide trousers that is recognized today. This modernization was initially controversial but eventually became widely accepted.</p>
      <p class="mb-4">Structurally, the Ao Dai consists of two main parts: the long tunic and the loose-fitting trousers. The tunic is slit on both sides, extending from the waist down, which allows for freedom of movement. The close-fitting nature of the tunic is designed to flatter the wearer's body, creating a silhouette that is both graceful and modest. Traditionally, the color of the Ao Dai held significant meaning. Young girls would wear pure white, symbolizing their innocence and youth. As they grew older, they would switch to soft pastel shades. Married women typically wore rich, dark colors. However, in modern Vietnam, these color rules are no longer strictly followed, and people choose colors based on personal preference and fashion trends.</p>
      <p class="mb-4">While the Ao Dai is no longer the required daily attire for most Vietnamese women, it still holds a special place in the nation's heart. It is worn on special occasions such as Tet (the Lunar New Year), weddings, and other formal ceremonies. Many high school girls in Vietnam are still required to wear a white Ao Dai as their school uniform, a practice that preserves its legacy for the younger generation. The garment is a powerful symbol of Vietnamese beauty and resilience, having survived centuries of historical change and foreign influence to remain an iconic element of the country's culture.</p>
    `,
    questions: [
      {
        id: 1,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "1. The modern Ao Dai was designed in the 19th century.",
        correctAnswer: "False",
        explanation: "The passage states that the redesign happened 'during the 1930s,' which is in the 20th century. Therefore, the statement is false."
      },
      {
        id: 2,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "2. The designer who modernized the Ao Dai was influenced by Western fashion.",
        correctAnswer: "True",
        explanation: "The text says the redesign occurred 'under the influence of French fashion.' France is a Western country. Therefore, the statement is true."
      },
      {
        id: 3,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "3. In the past, the color of a woman's Ao Dai indicated her marital status.",
        correctAnswer: "True",
        explanation: "The passage says, 'Married women typically wore rich, dark colors,' which shows a link between color and marital status. Therefore, the statement is true."
      },
      {
        id: 4,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "4. The Ao Dai is commonly worn as everyday clothing by all Vietnamese women today.",
        correctAnswer: "False",
        explanation: "The passage states, 'the Ao Dai is no longer the required daily attire for most Vietnamese women,' and it is worn on 'special occasions.' Therefore, the statement is false."
      },
       {
        id: 5,
        type: QuestionType.TRUE_FALSE_NOT_GIVEN,
        questionText: "5. The Ao Dai is completely banned as a school uniform in modern Vietnam.",
        correctAnswer: "False",
        explanation: "The passage states the opposite: 'Many high school girls in Vietnam are still required to wear a white Ao Dai as their school uniform.' Therefore, the statement is false."
      },
    ],
  },
  {
    id: 'History of Coffee',
    title: 'The History of Coffee',
    difficulty: 5.5,
    passage: `
      <p class="mb-4">The story of coffee is a rich and aromatic one, beginning centuries ago in the highlands of Ethiopia. According to popular legend, a 9th-century goat herder named Kaldi noticed that his goats became incredibly energetic after eating the red berries from a particular tree. Kaldi tried the berries himself and experienced a similar stimulating effect. He reported his findings to the abbot of a local monastery, who made a drink with the berries and found it kept him alert through long hours of evening prayer. The knowledge of these energizing berries soon spread.</p>
      <p class="mb-4">From Ethiopia, coffee cultivation and trade began on the Arabian Peninsula. By the 15th century, coffee was being grown in Yemen, and by the 16th century, it was known in Persia, Egypt, Syria, and Turkey. Coffee was not only enjoyed in homes but also in the many public coffee houses — called 'qahveh khaneh' — which began to appear in cities across the Near East. These coffee houses became important centers for social activity and the exchange of information.</p>
      <p class="mb-4">European travelers to the Near East brought back stories of this unusual dark black beverage. By the 17th century, coffee had made its way to Europe through the bustling port of Venice, Italy, a major hub for trade. The first European coffee house opened in Venice in 1645. The beverage was initially met with some suspicion, but it quickly grew in popularity. Coffee houses spread rapidly across Europe, becoming centers for intellectual discussion, commerce, and social gathering, much as they had been in the Middle East. They played such a significant role in social life that they were often referred to as 'schools of the wise'.</p>
    `,
    questions: [
      { id: 1, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "1. Coffee was first discovered in South America.", correctAnswer: "False", explanation: "The passage states that coffee's story began 'in the highlands of Ethiopia.' Ethiopia is in Africa, not South America. Therefore, the statement is false." },
      { id: 2, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "2. A goat herder observed his animals becoming more active after consuming coffee berries.", correctAnswer: "True", explanation: "The legend mentioned in the first paragraph says a goat herder 'noticed that his goats became incredibly energetic after eating the red berries.' Therefore, the statement is true." },
      { id: 3, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "3. Venice was the first city in Europe to have a coffee house.", correctAnswer: "True", explanation: "The third paragraph states: 'The first European coffee house opened in Venice in 1645.' Therefore, the statement is true." },
      { id: 4, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "4. Coffee houses in Europe were exclusively for the wealthy elite.", correctAnswer: "Not Given", explanation: "The passage describes coffee houses as centers for 'intellectual discussion, commerce, and social gathering,' but it does not mention whether they were only for the wealthy. Therefore, the information is not given." },
      { id: 5, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "5. Coffee was immediately popular and accepted by all Europeans.", correctAnswer: "False", explanation: "The passage notes that the beverage 'was initially met with some suspicion' before it grew in popularity. Therefore, the statement is false." },
    ],
  },
  {
    id: 'Impact of Social Media',
    title: 'The Impact of Social Media',
    difficulty: 7.0,
    passage: `
      <p class="mb-4">In the 21st century, social media has become an integral part of daily life for billions of people, especially young adults and teenagers. Platforms like Instagram, TikTok, and X (formerly Twitter) have fundamentally changed how we communicate, consume information, and interact with one another. The benefits of this hyper-connectivity are numerous. Social media allows individuals to maintain relationships with friends and family across geographical distances, share experiences, and find communities of like-minded people. It can be a powerful tool for social and political change, enabling activists to organize and raise awareness on a global scale.</p>
      <p class="mb-4">However, the widespread use of social media is not without its drawbacks. A growing body of research has highlighted potential negative effects on mental health. The curated, often idealized, images and lifestyles displayed online can lead to social comparison, which may foster feelings of inadequacy, anxiety, and depression among users. The pressure to present a 'perfect' life can be immense. Furthermore, cyberbullying has emerged as a serious problem, causing significant emotional distress to its victims.</p>
      <p class="mb-4">Another significant concern is the spread of misinformation and 'fake news'. False or misleading information can be shared rapidly across social networks, making it difficult for users to distinguish fact from fiction. This can have serious consequences, influencing public opinion and even affecting democratic processes. Therefore, while social media offers unprecedented opportunities for connection and communication, it is crucial for users to approach it with a critical mindset. Developing digital literacy skills—the ability to find, evaluate, and create information online—is more important than ever to navigate this complex digital landscape safely and effectively.</p>
    `,
    questions: [
      { id: 1, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "1. The passage argues that social media is entirely negative and should be avoided.", correctAnswer: "False", explanation: "The passage discusses both benefits (e.g., maintaining relationships) and drawbacks (e.g., mental health effects), presenting a balanced view, not an entirely negative one. Therefore, the statement is false." },
      { id: 2, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "2. Social media can help people feel more connected to others who live far away.", correctAnswer: "True", explanation: "The first paragraph states that social media 'allows individuals to maintain relationships with friends and family across geographical distances.' Therefore, the statement is true." },
      { id: 3, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "3. The passage states that everyone who uses social media will experience depression.", correctAnswer: "False", explanation: "The passage says social comparison 'may foster feelings of inadequacy, anxiety, and depression,' indicating a possibility, not a certainty for everyone. Therefore, the statement is false." },
      { id: 4, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "4. Digital literacy skills are identified as important for using social media safely.", correctAnswer: "True", explanation: "The last paragraph concludes that 'Developing digital literacy skills...is more important than ever to navigate this complex digital landscape safely and effectively.' Therefore, the statement is true." },
      { id: 5, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "5. The passage suggests that all information found on social media is unreliable.", correctAnswer: "Not Given", explanation: "The passage mentions the spread of 'misinformation and fake news' as a concern, but it does not claim that *all* information is unreliable. Therefore, the information is not given." },
    ],
  },
  {
    id: 'The Importance of Sleep',
    title: 'The Importance of Sleep',
    difficulty: 6.0,
    passage: `
      <p class="mb-4">Sleep is a fundamental human need, as crucial to our well-being as food, water, and air. Yet, in our fast-paced, 24/7 society, it is often the first thing we sacrifice. Experts recommend that adults get between 7 to 9 hours of quality sleep per night, but many people fall short of this goal. This sleep deficit can have profound and wide-ranging negative effects on both our physical and mental health.</p>
      <p class="mb-4">Physically, sleep is a critical time for the body to repair and rejuvenate itself. During deep sleep, the body releases growth hormone, which helps to repair tissues and muscles. The immune system is also strengthened, producing proteins called cytokines that help fight infection and inflammation. Chronic sleep deprivation is linked to a host of serious health problems, including heart disease, high blood pressure, diabetes, and obesity. It weakens our ability to fight off common illnesses like the cold and flu.</p>
      <p class="mb-4">Mentally, sleep is just as vital. It plays a key role in brain function, including concentration, productivity, and cognition. While we sleep, our brains work to consolidate memories, processing the information gathered during the day and storing it in our long-term memory. A lack of sleep can impair our ability to focus, think clearly, and make sound decisions. Furthermore, there is a strong link between poor sleep and mood disorders such as depression and anxiety. Getting enough rest is therefore not a luxury, but an essential component of a healthy and productive life.</p>
    `,
    questions: [
      { id: 1, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "1. The passage suggests that sleep is more important than a healthy diet.", correctAnswer: "Not Given", explanation: "The passage states sleep is 'as crucial...as food, water, and air,' implying equal importance, but it does not make a direct comparison to say one is *more* important. Therefore, the information is not given." },
      { id: 2, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "2. The body repairs itself primarily when we are awake and active.", correctAnswer: "False", explanation: "The passage states that 'sleep is a critical time for the body to repair and rejuvenate itself' and that growth hormone is released 'During deep sleep.' Therefore, the statement is false." },
      { id: 3, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "3. A lack of sleep can make a person more likely to get sick.", correctAnswer: "True", explanation: "The text says sleep deprivation 'weakens our ability to fight off common illnesses like the cold and flu,' which means a person is more likely to get sick. Therefore, the statement is true." },
      { id: 4, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "4. The brain is completely inactive during sleep.", correctAnswer: "False", explanation: "The passage explains that while we sleep, 'our brains work to consolidate memories, processing the information gathered during the day.' This is an active process. Therefore, the statement is false." },
      { id: 5, type: QuestionType.TRUE_FALSE_NOT_GIVEN, questionText: "5. All adults require exactly 8 hours of sleep per night for optimal health.", correctAnswer: "False", explanation: "The passage gives a recommended range: 'adults get between 7 to 9 hours of quality sleep per night,' not exactly 8 hours. Therefore, the statement is false." },
    ],
  },
];