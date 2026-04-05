// about.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Array of structural chunks logically breaking down the text
    const aboutData = [
        { type: 'h2', text: 'The End of Endless Searching. Welcome to ShopSmart.' },
        { type: 'h3', text: 'The Mission' },
        { type: 'p', text: 'Have you ever found yourself drowning in a sea of open browser tabs, frantically bouncing between Amazon, Myntra, Flipkart, and eBay just to make sure you aren\'t overpaying? We have been there, too.' },
        { type: 'p', text: 'ShopSmart was built with a single, simple mission: to cure the headache of fragmented online shopping. We believe that finding the perfect price shouldn\'t feel like a high-stakes scavenger hunt.' },
        
        { type: 'h3', text: 'What We Do' },
        { type: 'p', text: 'We are your ultimate digital shopping assistant. ShopSmart provides a beautifully unified space where you can drop a product name or image into our search engine and let the magic happen. In seconds, our platform scans the entire web, compares real-time offers across all major e-commerce retailers, and brings the absolute lowest price straight to your screen.' },
        { type: 'p', text: 'No extra tabs. No hidden costs. Just smart shopping, simplified.' },
        
        { type: 'h3', text: 'Why Choose ShopSmart?' },
        { type: 'ul', items: [
            { strong: 'Real-Time Price Comparison:', text: ' We do the heavy lifting, instantly comparing prices across giants like Amazon, Reliance Digital, Myntra, and more.' },
            { strong: 'Price Drop Tracking:', text: ' Don\'t want to buy just yet? Smart shoppers know how to wait. Create an account to track your favorite items and get notified the moment the price drops.' },
            { strong: 'Unified Experience:', text: ' Say goodbye to cluttered screens. Discover every retailer and secure the perfect price from one clean, user-friendly dashboard.' }
        ]},
        
        { type: 'h3', text: 'Behind the Code' },
        { type: 'p', text: 'ShopSmart is designed and developed by Sanil, a Computer Engineering student passionate about building clean, functional UI/UX experiences that solve real-world problems. What started as a vision to reduce digital friction has evolved into a fully streamlined tool designed to put the power of price transparency back into the shopper\'s hands.' }
    ];

    const container = document.getElementById('typewriterOutput');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    
    // Hardcoded typing speed (extremely fast to prevent waiting times for huge blocks)
    const TYPE_SPEED_MS = 3;

    async function typeTextNode(node, text) {
        node.appendChild(cursor); // Mount the cursor to the active element
        
        for(let i = 0; i < text.length; i++) {
            // Insert the current letter right before the cursor cursor natively inside DOM
            const textNode = document.createTextNode(text[i]);
            node.insertBefore(textNode, cursor);
            
            // Wait
            await new Promise(r => setTimeout(r, TYPE_SPEED_MS));
        }
    }

    async function sequenceAnimation() {
        for(let block of aboutData) {
            if(block.type === 'ul') {
                const ul = document.createElement('ul');
                container.appendChild(ul);
                
                for(let item of block.items) {
                    const li = document.createElement('li');
                    ul.appendChild(li);
                    
                    const strong = document.createElement('strong');
                    li.appendChild(strong);
                    await typeTextNode(strong, item.strong);
                    
                    const span = document.createElement('span');
                    li.appendChild(span);
                    await typeTextNode(span, item.text);
                }
            } else {
                const el = document.createElement(block.type);
                container.appendChild(el);
                await typeTextNode(el, block.text);
            }
        }
        
        // Once full animation breaks the loop, we leave the cursor blinking natively.
        container.appendChild(cursor);
    }

    // Give DOM a small tick before firing off the animation queue
    setTimeout(sequenceAnimation, 400);
});
