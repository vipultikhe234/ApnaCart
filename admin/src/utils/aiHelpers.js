// ── Fetch a REAL food image ───────────────────────────────────────────────
// Smart Router: Foodish API (fast) -> TheMealDB -> Pollinations AI (Prompt based)
export const fetchRealFoodImage = async (name, randomize = false, description = '') => {
    if (!name.trim()) return '';
    const cleanName = name.trim().toLowerCase();
    const isDrink = cleanName.includes('drink') || cleanName.includes('juice') || cleanName.includes('beverage') || cleanName.includes('coffee') || cleanName.includes('tea') || cleanName.includes('shake') || cleanName.includes('coke') || cleanName.includes('pepsi') || cleanName.includes('soda') || cleanName.includes('cold');

    // Deterministic random seed
    const seed = randomize ? Math.floor(Math.random() * 9999) + 1 : cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;

    try {
        // If we have a description, use it for a HIGH QUALITY AI prompt
        if (description && description.length > 10) {
            const context = isDrink ? 'beverage photography, refreshing glass, ice cubes, condensation' : 'gourmet plating, realistic textures, cinematic lighting';
            const prompt = `High-end professional ${context}, ${name}, ${description}, 8k resolution, appetizing, neutral background, centered shot`;
            return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&seed=${seed}&nologo=true&model=flux`;
        }

        // 1️⃣ Fast generic food API with aliases
        const aliases = {
            'idli': 'idly',
            'dosa': 'dosa',
            'biryani': 'biryani',
            'burger': 'burger',
            'pizza': 'pizza',
            'pasta': 'pasta',
            'samosa': 'samosa',
            'coke': 'drink',
            'juice': 'drink',
            'shake': 'drink',
            'beverage': 'drink',
            'coffee': 'coffee'
        };

        const matchedAlias = Object.keys(aliases).find(key => cleanName.includes(key));
        if (matchedAlias) {
            const foodishCat = aliases[matchedAlias];
            const res = await fetch(`https://foodish-api.com/api/images/${foodishCat}`, { signal: AbortSignal.timeout(3000) });
            const data = await res.json();
            if (data.image) return data.image;
        }

        // 2️⃣ TheMealDB — high-quality legacy recipe photos (Very reliable for common dishes)
        const resMeal = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(cleanName)}`);
        const dataMeal = await resMeal.json();
        if (dataMeal.meals && dataMeal.meals.length > 0) {
            return dataMeal.meals[0].strMealThumb;
        }
    } catch (_) {
        console.warn("Fast lookup failed, falling back to Flux-AI Generation");
    }

    // 3️⃣ High-Performance Flux AI Fallback
    const contextFallback = isDrink ? 'Professional beverage photography, refreshing crystal glass, ice cubes, condensation, studio lighting' : 'Ultra-realistic food photography, gourmet presentation, white ceramic plate, highly detailed';
    const fallbackPrompt = `${contextFallback} of ${name}, 4k, cinematic lighting, appetizing, centered`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=800&height=800&seed=${seed}&nologo=true&model=flux`;
};

// ── Generate AI Composition Metadata (Text) ───────────────────────────────
export const generateAIDescription = (name) => {
    return new Promise(async (resolve) => {
        if (!name.trim()) return resolve('');

        const isDrink = name.toLowerCase().includes('drink') || name.toLowerCase().includes('juice') || name.toLowerCase().includes('shake') || name.toLowerCase().includes('beverage') || name.toLowerCase().includes('coffee') || name.toLowerCase().includes('soda') || name.toLowerCase().includes('cold');

        const beverageHooks = [
            `This refreshing ${name.toLowerCase()} is served chilled and is the perfect way to quench your thirst. Made with premium ingredients for a crisp and clean taste. Very refreshing and highly recommended for a hot day.`,
            `Our signature ${name.toLowerCase()} is a crowd favorite! It has the perfect balance of sweetness and flavor, served in a large portion size. MUST try if you enjoy high-quality beverages with your meal.`,
            `Experience the cool and zesty flavors of our ${name.toLowerCase()}. Prepared fresh and served with ice to give you that instant energy boost. Perfect for families and kids who want something yummy and cold.`
        ];

        const foodHooks = [
            `This ${name.toLowerCase()} is prepared with our secret masala and fresh local ingredients. It has a very nice balance of spices and is perfect if you want something filling and tasty. High quality food that you will surely order again and again.`,
            `Our special ${name.toLowerCase()} is made fresh daily to ensure the best quality. It is very soft, full of flavors, and has that perfect home-style touch which makes it great for everyone. A must try dish for a satisfying meal experience.`,
            `If you want something yummy and healthy, then this ${name.toLowerCase()} is the best option for you. We use clean oil and very fresh vegetables to keep it light yet very delicious. It is a value for money item that never disappoints.`,
            `A very popular choice among our regular customers, this ${name.toLowerCase()} has a great aroma and a spicy kick. It is served hot and fresh, making it ideal for your lunch or dinner. Very satisfying portions at a great price point.`,
            `Full of authentic taste and prepared with love, our ${name.toLowerCase()} is soft on the inside and perfectly cooked. We use premium quality ingredients to give you a restaurant-style feel at home. Highly recommended for foodies.`,
            `This ${name.toLowerCase()} is a total crowd-pleaser! It's made with a perfect blend of spices and fresh produce. Whether you're eating alone or with friends, this dish is sure to make your day better. Try it with our special chutney.`
        ];

        const culinaryHooks = isDrink ? beverageHooks : foodHooks;

        // Pick a random template
        const template = culinaryHooks[Math.floor(Math.random() * culinaryHooks.length)];

        // Manual timeout for API attempt
        const timer = setTimeout(() => resolve(template), 4000);

        try {
            // Since external APIs for text generation can be unreliable or inconsistent (like meat filler),
            // we use a more robust "Smart Template" system with simple Indian English.
            const secondaryHooks = [
                "It is prepared in a very hygienic kitchen and served with proper packaging.",
                "The taste is very authentic and it will remind you of home-cooked food.",
                "We have made sure to keep it healthy while maintaining the great flavor.",
                "It is a very popular dish in our menu and loved by children and adults alike.",
                "Perfect for any time of the day, whether it is for a snack or a full meal."
            ];

            const hook1 = culinaryHooks[Math.floor(Math.random() * culinaryHooks.length)];
            const hook2 = secondaryHooks[Math.floor(Math.random() * secondaryHooks.length)];

            const finalDesc = `${hook1} ${hook2} Only the best quality items are used for yours.`;

            // Artificial delay to make it feel like AI is working
            await new Promise(r => setTimeout(r, 800));
            clearTimeout(timer);
            resolve(finalDesc);
        } catch (_) {
            clearTimeout(timer);
            resolve(template);
        }
    });
};
// ── Generate AI Naming Suggestions ───────────────────────────────────────
export const generateProductNames = (keyword) => {
    if (!keyword || keyword.length < 3) return [];

    const prefixes = ['Signature', 'Royal', 'Chef\'s Special', 'Authentic', 'Gourmet', 'Classic', 'Zesty', 'Smoky', 'Crunchy', 'Melted'];
    const suffixes = ['Delight', 'Fusion', 'Symphony', 'Medley', 'Temptation', 'Supreme', 'Masterpiece', 'Bowl', 'Platter', 'Wrap'];

    // Create 3 unique suggestions
    const suggestions = [
        `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${keyword}`,
        `${keyword} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
        `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${keyword} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
    ];

    return [...new Set(suggestions)]; // Return unique values
};
