
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// --- MIGRATION DATA ---

const vsPost1 = {
    oldSlug: 'tapa-dura-vs-tapa-flexible-como-elegir-la-agenda-ideal-segun-tu-estilo-de-vida-y-rutina',
    newSlug: 'tapa-dura-eleccion-inteligente-estilo-vida',
    title: 'Tapa Dura: La Elección Inteligente para tu Estilo de Vida Agitado',
    excerpt: '¿Tu agenda viaja contigo a todos lados? Descubre por qué la tapa dura es la única opción que garantiza que tus planes lleguen intactos a fin de año.',
    seoTitle: 'Agenda Tapa Dura: La Mejor Opción para tu Rutina 2026',
    seoDescription: 'Olvídate de las tapas dobladas. Descubre por qué una agenda de tapa dura es la inversión inteligente para proteger tu organización en 2026.',
    content: `
<h1>Tapa Dura: La Elección Inteligente para tu Estilo de Vida y Rutina</h1>
<p class="lead">El fin de año se acerca y con él, la elección de tu compañera de batalla para el 2026. Si eres de los que lleva la agenda en la mochila, el auto o la cartera, la durabilidad no es negociable. Analizamos por qué la <strong>Tapa Dura Laminada</strong> es la reina indiscutible de la organización.</p>

<h2>Durabilidad a toda prueba</h2>
<p>Seamos honestos: la vida no sucede solo en un escritorio. Tu agenda se enfrenta a llaves, botellas de agua, caídas accidentales y el ajetreo diario de Montevideo (o donde estés). Las tapas flexibles, aunque ligeras, tienden a doblarse en las esquinas y ofrecen poca protección al papel interior.</p>
<p>En <strong>Kamaluso</strong>, hemos apostado 100% por la <strong>Tapa Dura Laminada</strong>. ¿Por qué? Porque es un escudo. El cartón de alta densidad recubierto protege tus notas, tus citas y tus sueños de cualquier accidente. Llegar a diciembre con la agenda impecable es posible.</p>

<h2>Escritura todoterreno</h2>
<p>¿Alguna vez tuviste que anotar algo rápido apoyando la agenda en tus rodillas o en el aire? Con una tapa flexible es una misión imposible. La rigidez de la tapa dura te ofrece un escritorio portátil instantáneo. Anota esa idea brillante donde sea que te encuentre la inspiración.</p>

<h2>Presencia y Profesionalismo</h2>
<p>Ya sea en una reunión de trabajo o en la universidad, sacar una agenda robusta y bien cuidada habla de tu compromiso con la organización. Nuestros diseños personalizados en tapa dura lucen vibrantes y profesionales durante todo el año, gracias al laminado que realza los colores y protege el diseño.</p>

<h2>Conclusión: Inierte en Calidad</h2>
<p>Tu 2026 merece un soporte que esté a la altura de tus metas. No dejes que una tapa doblada arruine tu planificación. Elige resistencia, elige estilo, elige <strong>Kamaluso Tapa Dura</strong>.</p>
    `
};

const vsPost2 = {
    oldSlug: 'tapa-dura-vs-tapa-flexible-la-guia-definitiva-para-elegir-tu-proxima-agenda',
    newSlug: 'guia-definitiva-ventajas-agenda-tapa-dura',
    title: 'Guía Definitiva: Por qué una Agenda de Tapa Dura es tu Mejor Inversión',
    excerpt: '¿Buscas calidad y resistencia? Te explicamos técnicamente por qué nuestras agendas de tapa dura laminada superan cualquier expectativa de durabilidad.',
    seoTitle: 'Ventajas Agenda Tapa Dura 2026: Guía Definitiva',
    seoDescription: 'Antes de comprar tu agenda 2026, lee esto. Desglosamos las ventajas técnicas y estéticas de elegir una agenda de tapa dura de alta calidad.',
    content: `
<h1>Guía Definitiva: Por qué una Agenda de Tapa Dura es tu Mejor Inversión</h1>
<p class="lead">Cuando se trata de papelería personalizada, la calidad del material define la experiencia de uso. En Kamaluso, nos hemos especializado en la excelencia de la Tapa Dura. Aquí te explicamos técnicamente por qué es la opción superior.</p>

<h2>1. Protección Estructural</h2>
<p>La tapa dura actúa como una carcasa protectora para el block interior de hojas. Esto es vital para:</p>
<ul>
    <li>Evitar que las hojas se arruguen o doblen (el temido "efecto oreja de perro").</li>
    <li>Proteger contra derrames menores de líquidos en la superficie.</li>
    <li>Mantener la estructura del anillado metálico firme y segura.</li>
</ul>

<h2>2. Personalización que Dura</h2>
<p>Nuestras tapas no son solo cartón; son lienzos. Utilizamos un proceso de laminado especial (mate o brillo) sobre la impresión de alta resolución. Esto no solo hace que tu nombre o logo se vean increíbles, sino que sella el diseño. A diferencia de las tapas flexibles que pueden desgastarse por la fricción, nuestras tapas duras mantienen la intensidad del color desde enero hasta diciembre.</p>

<h2>3. Experiencia Táctil Premium</h2>
<p>Hay algo satisfactorio en el peso y la solidez de un buen libro o agenda de tapa dura. Transmite sensación de importancia y valor. Cuando sostienes una agenda Kamaluso, sientes que tienes en tus manos un producto de boutique, hecho a mano con dedicación en Uruguay.</p>

<h2>El Veredicto</h2>
<p>Si buscas una agenda "para salir del paso", cualquier opción sirve. Pero si buscas una compañera de vida para tu 2026, que respete y proteja tu tiempo, la <strong>Tapa Dura</strong> es la única opción lógica. Descubre nuestros diseños y siente la diferencia.</p>
    `
};

// --- GENERAL REPLACEMENTS ---
const replacements = [
    { regex: /Tapa Dura (y|o|vs\.?) (Tapa Flex(?:ible)?)/gi, replace: 'Tapa Dura' },
    { regex: /(?:semana a la vista|día por página) (?:y|o) (?:tapa flex(?:ible)?)/gi, replace: 'semana a la vista o día por página en nuestra exclusiva tapa dura' }, // Contextual fix attempt
    { regex: /Tapa Flex(?:ible)?/gi, replace: 'Tapa Dura' }, // Fallback for direct mentions
    { regex: /o flex\b/gi, replace: '' },
    { regex: /y flex\b/gi, replace: '' },
    { regex: /\/tapa-flex/gi, replace: '/tapa-dura' }, // Fix internal links
    { regex: /flexible/gi, replace: 'resistente' }, // Dangerous? "tapa resistente" sounds good. "horario flexible" -> "horario resistente" BAD.
    // Let's remove the "flexible -> resistente" one, it's too risky.
];

const saferReplacements = [
    { regex: /Tapa Dura (y|o|vs\.?) (Tapa Flex(?:ible)?)/gi, replace: 'Tapa Dura' },
    { regex: /Tapa Flex(?:ible)?/gi, replace: '' }, // Just remove it in lists? Or maybe replace with "gran calidad"
    { regex: /o flex\b/gi, replace: '' },
    { regex: /\/tapa-flex/gi, replace: '/tapa-dura' },
    { regex: /tapas flexibles/gi, replace: 'tapas duras' }, // "preferimos tapas flexibles" -> "preferimos tapas duras" (ok for us)
    // Specific fix for: "Selecciona Tapa Dura o Tapa Flex"
    { regex: /Selecciona Tapa Dura o Tapa Flex/gi, replace: 'Selecciona nuestra Tapa Dura Premium' },
];


async function updateContent() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        const Post = mongoose.models.Post || mongoose.model('Post', new mongoose.Schema({
            title: String, slug: String, content: String, excerpt: String, seoTitle: String, seoDescription: String
        }, { strict: false }));

        let newRedirects = [];

        // 1. UPDATE VS POSTS
        for (const update of [vsPost1, vsPost2]) {
            const post = await Post.findOne({ slug: update.oldSlug });
            if (post) {
                console.log(`Updating VS Post: ${update.oldSlug} -> ${update.newSlug}`);
                post.slug = update.newSlug;
                post.title = update.title;
                post.content = update.content;
                post.excerpt = update.excerpt;
                post.seoTitle = update.seoTitle;
                post.seoDescription = update.seoDescription;
                await post.save();

                newRedirects.push({
                    source: `/blog/${update.oldSlug}`,
                    destination: `/blog/${update.newSlug}`,
                    permanent: true
                });
            }
        }

        // 2. GENERAL CLEANUP
        const posts = await Post.find({
            slug: { $nin: [vsPost1.newSlug, vsPost2.newSlug] },
            $or: [{ content: /flex/i }, { content: /tapa-flex/i }]
        });

        console.log(`Scanning ${posts.length} other posts for 'flex' mentions...`);

        for (const post of posts) {
            let modified = false;
            let newContent = post.content;

            // Apply replacements
            if (newContent) {
                // Specific complex replacements
                newContent = newContent.replace(/Tapa Dura (y|o|vs\.?) (Tapa Flex(?:ible)?)/gi, 'Tapa Dura');
                newContent = newContent.replace(/tapa flexible/gi, 'tapa dura'); // Bold move
                newContent = newContent.replace(/o flex\b/gi, '');
                newContent = newContent.replace(/y flex\b/gi, '');
                newContent = newContent.replace(/\/tapa-flex/gi, '/tapa-dura');

                // Remove leftovers like " , " or " . " if replacements left holes? 
                // Hard to do simply. 
            }

            if (newContent !== post.content) {
                post.content = newContent;
                modified = true;
            }

            if (modified) {
                console.log(`clean-up: Updated post ${post.slug}`);
                await post.save();
            }
        }

        // 3. SAVE REDIRECTS
        const redirectsPath = path.join(__dirname, '../redirects-map.json');
        let currentRedirects = [];
        if (fs.existsSync(redirectsPath)) {
            currentRedirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
        }

        // Merge removing duplicates
        const allRedirects = [...currentRedirects];
        for (const r of newRedirects) {
            if (!allRedirects.find(cr => cr.source === r.source)) {
                allRedirects.push(r);
            }
        }

        fs.writeFileSync(redirectsPath, JSON.stringify(allRedirects, null, 2));
        console.log(`Updated redirects-map.json with ${newRedirects.length} new blog redirects.`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

updateContent();
