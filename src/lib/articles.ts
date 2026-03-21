
export type Article = {
  title: string;
  slug: string;
  description: string;
  image: string;
  imageHint: string;
  content: string;
};

type ArticleCategory = "beginner" | "intermediate" | "advanced";

export const articles: Record<ArticleCategory, Article[]> = {
  beginner: [
    {
      title: "A Day at the Park",
      slug: "a-day-at-the-park",
      description: "Read a simple story about a fun day at the park.",
      image: "https://picsum.photos/seed/sunny-day-park/600/400",
      imageHint: "park nature",
      content: `It is a sunny day. Maria and her brother, Leo, go to the park. They see many things.

They see a big, green tree. A small, red bird sits on a branch. The bird sings a happy song. Maria smiles.

Leo has a blue ball. He throws the ball. Their dog, Max, runs to catch it. Max is a happy dog. He wags his tail.

They walk to a pond. They see ducks in the water. The ducks are yellow and brown. They make a "quack" sound.

Maria and Leo sit on a bench. They eat sandwiches for lunch. Maria has a cheese sandwich. Leo has a peanut butter sandwich. They share an apple.

After lunch, they play on the swings. They go up and down, up and down. It is a lot of fun.

Soon, it is time to go home. They had a very good day at the park.`,
    },
    {
      title: "My Favorite Food",
      slug: "my-favorite-food",
      description: "Learn vocabulary about food and describing preferences.",
      image: "https://picsum.photos/seed/delicious-pizza/600/401",
      imageHint: "food pizza",
      content: `My name is Sam, and I want to tell you about my favorite food. My favorite food is pizza.

I love pizza because it is delicious. There are many types of pizza. My favorite kind is pepperoni pizza. It has cheese, tomato sauce, and small pieces of pepperoni on top.

My family orders pizza every Friday night. We watch a movie and eat pizza together. It is a special tradition for us.

Sometimes, my dad makes pizza at home. We help him. I put the cheese on top. My sister puts on the vegetables. Making pizza is fun.

Pizza comes from Italy. It is a very popular food all over the world. Many people love pizza, just like me.

What is your favorite food? Maybe it is pizza too!`,
    },
    {
      title: "My Daily Routine",
      slug: "my-daily-routine",
      description: "Learn about simple daily activities.",
      image: "https://picsum.photos/seed/morning-routine/600/406",
      imageHint: "morning clock",
      content: `Every day, I wake up at 7:00 AM. The sun comes through my window. I stretch my arms and get out of bed.

First, I go to the bathroom to brush my teeth. I use a green toothbrush and mint toothpaste. Then, I wash my face with cool water. It helps me wake up.

After that, I go to the kitchen to have breakfast. I usually eat cereal with milk and a banana. Breakfast is the most important meal of the day.

At 8:00 AM, I get dressed for school. I wear a uniform. It is a blue shirt and gray pants. I put my books in my backpack.

I walk to the bus stop with my friends. The big yellow bus takes us to school. School starts at 8:30 AM. I learn many new things every day.

This is my morning routine. It helps me start my day in a good way.`,
    },
    {
      title: "The Busy Town",
      slug: "the-busy-town",
      description: "A story about different jobs and places in a town.",
      image: "https://picsum.photos/seed/city-street/600/407",
      imageHint: "town street",
      content: `Welcome to Townsville. It is a busy place. Many people live and work here.

Let's look at the main street. You can see a post office. The mail carrier works here. He delivers letters and packages to everyone in town.

Next to the post office is a bakery. The baker is named Mrs. Chen. She wakes up very early to bake bread and cakes. The bakery smells wonderful.

Across the street is the fire station. The firefighters are always ready to help. They have a big, red fire truck.

There is also a library. The librarian helps people find books. It is a quiet place to read and learn. Children love the story time on Saturdays.

Dr. Evans works at the hospital. She is a doctor who helps sick people get better.

Everyone in Townsville has an important job. They work together to make the town a great place to live.`,
    },
    {
      title: "My School Day",
      slug: "my-school-day",
      description: "Follow a student through a typical day at school.",
      image: "https://picsum.photos/seed/school-day/600/412",
      imageHint: "school classroom",
      content: `I go to school every weekday. My school is big and has many classrooms. My teacher is Ms. Davis. She is very kind.

We learn math, science, and English. My favorite subject is art. I like to draw and paint.

During lunch, I eat with my friends in the cafeteria. After school, I do my homework and then play outside.

I love my school.`,
    },
    {
      title: "The Four Seasons",
      slug: "the-four-seasons",
      description: "Learn about spring, summer, autumn, and winter.",
      image: "https://picsum.photos/seed/four-seasons/600/413",
      imageHint: "seasons nature",
      content: `There are four seasons in a year: spring, summer, autumn, and winter.

In spring, the flowers bloom and the weather gets warmer. It is a beautiful time of year.

Summer is very hot. People go to the beach and swim in the ocean. I like to eat ice cream in the summer.

In autumn, the leaves on the trees change colors. They turn red, yellow, and orange. The weather becomes cool.

Winter is cold. Sometimes it snows. People wear warm coats and hats. Each season is special.`
    },
  ],
  intermediate: [
    {
      title: "New Study on Sleep Habits",
      slug: "new-study-on-sleep-habits",
      description: "An article about recent scientific findings on the importance of sleep.",
      image: "https://picsum.photos/seed/sleep-science/600/402",
      imageHint: "science sleep",
      content: `A recent study published in the "Journal of Health and Wellness" highlights the critical importance of consistent sleep schedules. Researchers followed 2,000 adults over five years and found that those who went to bed and woke up at the same time every day, even on weekends, reported better mental health and lower stress levels.

The lead researcher, Dr. Anya Sharma, explained that a regular sleep-wake cycle helps to regulate the body's internal clock, known as the circadian rhythm. This rhythm influences hormone production, body temperature, and metabolism. When this cycle is disrupted, it can lead to a variety of health problems, including an increased risk of obesity and heart disease.

The study also found that getting at least seven to eight hours of sleep per night was crucial. Participants who slept less than six hours a night were 40% more likely to report symptoms of anxiety or depression.

The researchers offer a few simple tips for improving sleep habits: avoid caffeine and large meals before bed, create a relaxing bedtime routine like reading a book, and make sure your bedroom is dark, quiet, and cool. They emphasize that making small, consistent changes can have a big impact on overall well-being.`,
    },
    {
      title: "Traveling on a Budget",
      slug: "traveling-on-a-budget",
      description: "Tips and tricks for seeing the world without breaking the bank.",
      image: "https://picsum.photos/seed/travel-savings/600/403",
      imageHint: "travel map",
      content: `Seeing the world doesn't have to be expensive. With some careful planning, you can explore new destinations without spending a fortune. Here are some essential tips for traveling on a budget.

First, be flexible with your travel dates. Flying on weekdays or during the off-season can save you a significant amount of money on airfare. Use flight comparison websites to find the best deals.

Second, consider alternative accommodation. Instead of hotels, look into hostels, guesthouses, or vacation rentals. These options are often cheaper and provide a more local experience.

Third, eat like a local. Avoid tourist-heavy restaurants and seek out street food stalls or local markets. Not only is it more affordable, but it's also a great way to experience the authentic cuisine of a place. Packing your own lunch and snacks can also cut down on costs.

Finally, take advantage of free activities. Many cities have beautiful parks, free museums, and walking tours. Research your destination beforehand to find free attractions and events. By being a smart traveler, you can make your dream trip a reality without breaking the bank.`,
    },
    {
      title: "The Benefits of Exercise",
      slug: "benefits-of-exercise",
      description: "Discover why regular physical activity is good for you.",
      image: "https://picsum.photos/seed/fitness-health/600/408",
      imageHint: "running sport",
      content: `Regular exercise is one of the most effective ways to improve your physical and mental health. Engaging in physical activity offers a wide range of benefits that can enhance your quality of life.

On a physical level, exercise strengthens your cardiovascular system, which includes your heart and blood vessels. This reduces the risk of heart disease, lowers blood pressure, and improves circulation. It also helps with weight management by burning calories and building muscle mass, which boosts your metabolism. Furthermore, activities like running or weightlifting improve bone density, making your bones stronger and less prone to fractures.

The mental health benefits of exercise are just as impressive. When you are active, your body releases endorphins, which are chemicals in the brain that act as natural painkillers and mood elevators. This can lead to reduced feelings of stress, anxiety, and depression. Regular exercise has also been shown to improve sleep quality, sharpen memory, and enhance cognitive function.

To reap these benefits, experts recommend at least 150 minutes of moderate-intensity aerobic exercise or 75 minutes of vigorous-intensity exercise per week, combined with strength training twice a week. The key is to find activities you enjoy, so you'll be more likely to stick with them long-term.`,
    },
    {
      title: "A Guide to Digital Photography",
      slug: "guide-to-digital-photography",
      description: "Learn the basics of taking better photos with your camera or phone.",
      image: "https://picsum.photos/seed/photo-camera/600/409",
      imageHint: "camera photography",
      content: `Digital photography has made it easier than ever to capture moments and express creativity. Whether you're using a smartphone or a dedicated camera, understanding a few basic principles can dramatically improve your pictures.

One of the most important elements is composition. A common technique is the "rule of thirds," where you imagine your frame is divided into a 3x3 grid. By placing your main subject along these lines or at their intersections, you can create a more balanced and visually interesting photo. Also, pay attention to leading lines, like roads or fences, which can draw the viewer's eye into the image.

Lighting is another crucial factor. Natural light is often the most flattering. Try to shoot during the "golden hours"—the periods shortly after sunrise and before sunset—when the light is soft and warm. Avoid using a direct flash, which can create harsh shadows. Instead, look for sources of soft, indirect light.

Finally, learn to control your camera's focus. Make sure your main subject is sharp and clear. Many cameras and phones allow you to tap on the screen to set the focus point. Experiment with different angles and perspectives to find the most compelling shot. Don't be afraid to take many pictures; with digital photography, you can easily delete the ones you don't like.`,
    },
    {
      title: "The Power of Habit",
      slug: "the-power-of-habit",
      description: "How our daily habits shape our lives and how to build good ones.",
      image: "https://picsum.photos/seed/good-habits/600/414",
      imageHint: "routine planning",
      content: `Habits are the small decisions you make and actions you perform every day. According to scientists, habits account for about 40 percent of our behaviors on any given day. Your life today is essentially the sum of your habits.

Understanding how habits are formed is the first step to changing them. A habit consists of three parts: a cue, a routine, and a reward. The cue is the trigger that tells your brain to go into automatic mode. The routine is the physical or mental action you take. The reward is what helps your brain figure out if this particular loop is worth remembering for the future.

To build a new good habit, you can start small. Instead of trying to make a huge change, focus on a tiny, manageable action. For example, if you want to start exercising, commit to doing just five minutes of it each day. The key is consistency. Over time, these small actions will compound and lead to significant results.`
    },
    {
      title: "A Brief History of Coffee",
      slug: "a-brief-history-of-coffee",
      description: "From ancient beans to a global phenomenon.",
      image: "https://picsum.photos/seed/coffee-history/600/415",
      imageHint: "coffee beans",
      content: `Coffee is one of the world's most popular beverages, but where did it come from? The story begins in the highlands of Ethiopia, where, according to legend, a goat herder named Kaldi discovered the stimulating effects of the coffee bean after noticing his goats became energetic after eating berries from a particular tree.

From Ethiopia, coffee cultivation and trade began on the Arabian Peninsula. By the 15th century, coffee was being grown in Yemen, and by the 16th century, it was known in Persia, Egypt, Syria, and Turkey. Public coffee houses, called "qahveh khaneh," appeared in cities across the Near East.

European travelers brought back stories of this unusual dark black beverage. By the 17th century, coffee had made its way to Europe, and coffee houses quickly became centers of social activity and communication. The demand for the beverage was so high that a coffee plant was smuggled out of the Arab world and cultivated on the Dutch island of Java, which is now part of Indonesia. This was the beginning of coffee's global expansion, leading to the vast industry we know today.`
    },
  ],
  advanced: [
    {
      title: "The Rise of Artificial Intelligence",
      slug: "the-rise-of-artificial-intelligence",
      description: "An in-depth look at the current state and future of AI.",
      image: "https://picsum.photos/seed/ai-future/600/404",
      imageHint: "technology robot",
      content: `Artificial Intelligence (AI) is rapidly transforming our world, from how we work and communicate to how we solve complex scientific problems. At its core, AI refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The field has evolved from simple rule-based systems to sophisticated neural networks and machine learning models capable of remarkable feats.

One of the most significant recent developments is the emergence of generative AI, which can create new content, such as text, images, and music. These models, like large language models (LLMs), are trained on vast datasets and can generate human-like responses, write code, and even compose poetry. This has opened up new possibilities for creative industries and automation.

However, the rapid advancement of AI also raises important ethical questions. Concerns about job displacement, algorithmic bias, and the potential for misuse are at the forefront of public discourse. Ensuring that AI is developed and deployed responsibly is one of the most critical challenges of our time. This involves creating robust regulatory frameworks and fostering a public dialogue about the societal impact of these powerful technologies. As we continue to push the boundaries of what AI can do, balancing innovation with ethical considerations will be paramount to harnessing its full potential for the benefit of humanity.`,
    },
    {
      title: "Climate Change: A Global Challenge",
      slug: "climate-change-a-global-challenge",
      description: "Explore the complex issues surrounding climate change and potential solutions.",
      image: "https://picsum.photos/seed/planet-earth/600/405",
      imageHint: "earth climate",
      content: `Climate change represents one of the most pressing and multifaceted challenges confronting the global community. The scientific consensus is unequivocal: human activities, primarily the burning of fossil fuels, have led to an unprecedented increase in greenhouse gas concentrations in the atmosphere, causing global temperatures to rise. The consequences are far-reaching, from more frequent and intense heatwaves, droughts, and floods to rising sea levels that threaten coastal communities.

Addressing this crisis requires a concerted and immediate global effort. The transition to renewable energy sources, such as solar and wind power, is a cornerstone of this effort. This shift not only mitigates carbon emissions but also spurs innovation and creates new economic opportunities. Furthermore, enhancing energy efficiency in buildings, transportation, and industries is crucial for reducing overall energy consumption.

Beyond mitigation, adaptation strategies are essential to build resilience in the face of unavoidable climate impacts. This includes developing early warning systems for extreme weather events, protecting and restoring natural ecosystems like forests and wetlands that act as carbon sinks, and investing in climate-resilient infrastructure. International cooperation, as exemplified by agreements like the Paris Accord, is vital for coordinating these efforts and ensuring that all nations, particularly developing ones, have the resources to contribute to and benefit from a sustainable future.`,
    },
    {
      title: "The History of the Internet",
      slug: "history-of-the-internet",
      description: "A look at the origins and evolution of the global network.",
      image: "https://picsum.photos/seed/internet-history/600/410",
      imageHint: "network computer",
      content: `The internet, a technology that has become integral to modern life, has a history rooted in military and academic research. Its origins can be traced back to the 1960s with the development of ARPANET, a project funded by the United States Department of Defense. The goal was to create a decentralized computer network that could withstand a partial outage, a concept critical during the Cold War.

A major breakthrough occurred in the 1970s with the development of TCP/IP (Transmission Control Protocol/Internet Protocol), a standardized set of communication protocols that allowed different networks to connect and communicate with each other. This "network of networks" formed the foundation of the modern internet.

The 1990s marked a pivotal moment when the internet became accessible to the public. The invention of the World Wide Web by Tim Berners-Lee, along with the first web browser, Mosaic, transformed the internet from a tool for scientists into a global information system. This decade saw exponential growth in internet users and the rise of commercial websites like Amazon and eBay.

Today, the internet continues to evolve with the advent of mobile technology, cloud computing, and the Internet of Things (IoT). It has democratized access to information, revolutionized industries, and created new forms of social interaction, fundamentally reshaping society in ways its creators could have never imagined.`,
    },
    {
      title: "The Psychology of Decision-Making",
      slug: "psychology-of-decision-making",
      description: "Understand the cognitive biases that influence our choices.",
      image: "https://picsum.photos/seed/decision-psychology/600/411",
      imageHint: "brain thinking",
      content: `Human decision-making is a complex process that is often assumed to be rational. However, decades of research in cognitive psychology have revealed that our choices are frequently influenced by a range of cognitive biases, which are systematic patterns of deviation from norm or rationality in judgment.

One of the most well-known is the "confirmation bias," our tendency to search for, interpret, and recall information in a way that confirms our preexisting beliefs. This can lead us to ignore evidence that contradicts our views, reinforcing our initial assumptions, whether they are correct or not.

Another powerful bias is the "anchoring effect," where we rely too heavily on the first piece of information offered (the "anchor") when making decisions. For example, an initial price quoted for a product can heavily influence our perception of its value, even if that price is arbitrary.

Loss aversion, the principle that the pain of losing something is psychologically twice as powerful as the pleasure of gaining something of equal value, also plays a critical role. This bias can make us overly cautious and resistant to change, even when the potential gains outweigh the potential losses.

Understanding these biases is the first step toward mitigating their impact. By being aware of these mental shortcuts, we can learn to approach decisions more critically, question our initial intuitions, and consider a wider range of information, ultimately leading to more objective and effective choices.`,
    },
     {
      title: "The Philosophy of Stoicism",
      slug: "the-philosophy-of-stoicism",
      description: "An ancient Greek philosophy for modern-day resilience.",
      image: "https://picsum.photos/seed/stoic-philosophy/600/416",
      imageHint: "statue philosophy",
      content: `Stoicism, an ancient Greek school of philosophy founded in Athens by Zeno of Citium in the early 3rd century BC, offers a timeless guide to living a good life. Its central teaching is that virtue, the highest good, is based on knowledge, and that the wise live in harmony with the divine Reason that governs nature. Stoics are known for their belief that we cannot control external events, only our responses to them.

A key practice in Stoicism is the "dichotomy of control." This principle involves distinguishing between what is within our power and what is not. Our judgments, opinions, and actions are within our control, while things like our health, wealth, and the actions of others are not. By focusing our energy exclusively on what we can control, we can achieve a state of tranquility, or "apatheia," freeing ourselves from the emotional turmoil caused by external events.

Modern cognitive-behavioral therapy (CBT) has drawn heavily from Stoic principles. The idea that our perceptions of events, rather than the events themselves, determine our emotional state is a cornerstone of both philosophies. In a world filled with uncertainty and distraction, Stoicism provides a practical framework for developing resilience, self-control, and inner peace.`
    },
    {
      title: "Quantum Computing Explained",
      slug: "quantum-computing-explained",
      description: "A primer on the next frontier of computation.",
      image: "https://picsum.photos/seed/quantum-computer/600/417",
      imageHint: "quantum computer",
      content: `Quantum computing represents a paradigm shift from classical computing. While classical computers store information in bits, which can be either a 0 or a 1, quantum computers use quantum bits, or "qubits." A qubit can exist in a superposition of both 0 and 1 simultaneously. This property, along with another quantum phenomenon called entanglement, gives quantum computers their immense processing power.

Superposition allows a qubit to represent multiple values at once. For a system with N qubits, it can represent 2^N states simultaneously. This exponential scaling means that quantum computers can tackle certain problems that are intractable for even the most powerful classical supercomputers. These problems include factoring large numbers (which has implications for cryptography), simulating complex molecular interactions (for drug discovery), and optimizing complex systems.

Entanglement is another counterintuitive concept where two or more qubits become linked in such a way that their fates are intertwined, regardless of the distance separating them. Measuring the state of one entangled qubit instantly influences the state of the other. This interconnectedness allows for powerful parallel processing.

Despite its promise, building a stable, large-scale quantum computer is an enormous engineering challenge. Qubits are extremely fragile and susceptible to "decoherence," where they lose their quantum properties due to interaction with the environment. Researchers are actively exploring various physical implementations for qubits, from superconducting circuits to trapped ions, in the race to build a fault-tolerant quantum machine.`
    },
  ],
};

// This function needs to be aware of dynamically added articles.
// We will manage articles in the component state, so this function is less critical now
// but we'll keep it for the slug-based page lookup.
let dynamicArticles: Record<ArticleCategory, Article[]> = { beginner: [], intermediate: [], advanced: [] };

export const setDynamicArticles = (articles: Record<ArticleCategory, Article[]>) => {
    dynamicArticles = articles;
}

export const getAllArticles = () => {
  const combinedArticles = {
      beginner: [...dynamicArticles.beginner, ...articles.beginner],
      intermediate: [...dynamicArticles.intermediate, ...articles.intermediate],
      advanced: [...dynamicArticles.advanced, ...articles.advanced],
  };

  const all = [
    ...combinedArticles.beginner,
    ...combinedArticles.intermediate,
    ...combinedArticles.advanced,
  ];

  // Remove duplicates by slug
  const uniqueArticles = all.filter((article, index, self) =>
    index === self.findIndex((a) => (
      a.slug === article.slug
    ))
  );

  return uniqueArticles;
};

export const getArticleBySlug = (slug: string) => {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    try {
        const storedArticlesJSON = localStorage.getItem('lingoland_reader_articles');
        if (storedArticlesJSON) {
            const storedArticles: Record<ArticleCategory, Article[]> = JSON.parse(storedArticlesJSON);
            const allStored = [...storedArticles.beginner, ...storedArticles.intermediate, ...storedArticles.advanced];
            const found = allStored.find(a => a.slug === slug);
            if (found) return found;
        }
    } catch(e) {
        console.error("Could not parse articles from localStorage", e);
    }
  }

  // Fallback to initial static articles
  return [...articles.beginner, ...articles.intermediate, ...articles.advanced].find(
    (article) => article.slug === slug
  );
};
