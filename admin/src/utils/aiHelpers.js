/**
 * ── Generate Ultra-High Professional Prompt (15 Lines) ──────────────────────
 * Produces highly detailed prompt according to the module type.
 */
const generateProfessionalPrompt = (name, type = 'product', description = '') => {
    const basePromptChunks = [
        "Masterpiece quality, 8k resolution, ultra-detailed photography.",
        "Cinematic lighting with professional studio setup.",
        "Shot on Phase One XF with 100MP sensor, 80mm lens, f/8 aperture.",
        "Macro photography capturing extreme fine textures and realistic depth.",
        "Perfect color balance, high dynamic range (HDR), ray-traced reflections.",
        "Sharp focus on subject, soft dreamy bokeh in the background.",
        "Commercial grade professional styling for high-end digital catalogs.",
        "Ambient occlusion, subsurface scattering on organic surfaces.",
        "Crystal clear clarity, sharp edges, zero digital noise or artifacts.",
        "Hyper-realistic rendering with realistic shadows and highlights."
    ];

    let specificContext = "";
    if (type === 'merchant' || type === 'outlet') {
        specificContext = `Modern professional outlet storefront for "${name}". 
        Elegant architectural design, vibrant signage, inviting atmosphere. 
        Highly detailed exterior with clean windows and professional lighting. 
        Bustling but organized environment, premium commercial aesthetic.`;
    } else if (type === 'offer') {
        specificContext = `Dynamic promotional banner for "${name}". High-contrast, vibrant, professional graphic design. Gourmet app discount style.`;
    } else if (type === 'category') {
        // FLAT VECTOR STYLE FOR CATEGORIES
        return `Flat vector food illustration for "${name}" category. 
        Modern 2D graphic design, vibrant colors, thick lines, minimalist aesthetic. 
        Clean solid color background, high-contrast, professional mobile app icon style. 
        Creative and appetizing visualization of ${name} in a premium flat art style. 
        Zero digital noise, sharp edges, vector quality, masterpiece.`.trim();
    } else {
        // Product (default)
        specificContext = `High-end gourmet food photography of "${name}". 
        ${description ? description : 'Mouth-watering presentation on a premium ceramic plate.'} 
        Fresh ingredients, steam rising, glistening textures. 
        Professional culinary plating, award-winning food styling.`;
    }

    return `${basePromptChunks.join("\n")}\n${specificContext}\nExtreme detail, 8k, photorealistic, premium feel.`.trim();
};

// ── Fetch a REAL food image ───────────────────────────────────────────────
export const fetchRealFoodImage = async (name, randomize = false, description = '', type = 'product') => {
    if (!name.trim()) return '';
    const cleanName = name.trim().toLowerCase();
    
    // Deterministic random seed
    const seed = randomize ? Math.floor(Math.random() * 99999) + 1 : cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5000;

    const professionalPrompt = generateProfessionalPrompt(name, type, description);
    
    // Using Flux model for exact 8k generation via Pollinations
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(professionalPrompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux&enhance=true`;
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
            `Full of authentic taste and prepared with love, our ${name.toLowerCase()} is soft on the inside and perfectly cooked. We use premium quality ingredients to give you a Merchant-style feel at home. Highly recommended for foodies.`,
            `This ${name.toLowerCase()} is a total crowd-pleaser! It's made with a perfect blend of spices and fresh produce. Whether you're eating alone or with friends, this dish is sure to make your day better. Try it with our special chutney.`
        ];

        const culinaryHooks = isDrink ? beverageHooks : foodHooks;
        const template = culinaryHooks[Math.floor(Math.random() * culinaryHooks.length)];
        const timer = setTimeout(() => resolve(template), 4000);

        try {
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
            await new Promise(r => setTimeout(r, 800));
            clearTimeout(timer);
            resolve(finalDesc);
        } catch (_) {
            clearTimeout(timer);
            resolve(template);
        }
    });
};

// ── Generate AI Naming Suggestions (Production Grade) ─────────────────────
export const generateProductNames = (keyword) => {
    if (!keyword || keyword.length < 3) return [];

    const prefixes = ['Signature', 'Royal', 'Chef\'s Special', 'Authentic', 'Gourmet', 'Classic', 'Zesty', 'Smoky', 'Crunchy', 'Melted'];
    const suffixes = ['Delight', 'Fusion', 'Symphony', 'Medley', 'Temptation', 'Supreme', 'Masterpiece', 'Bowl', 'Platter', 'Wrap'];

    const suggestions = [
        `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${keyword}`,
        `${keyword} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
        `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${keyword} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
    ];

    return [...new Set(suggestions)];
};

