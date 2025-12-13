// Script para extraer métricas clave de Lighthouse
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));

const perf = report.categories.performance;
const audits = report.audits;

console.log('\n📊 LIGHTHOUSE REPORT - KAMALUSO\n');
console.log('═══════════════════════════════════════\n');

console.log('🎯 SCORE GENERAL');
console.log(`Performance: ${Math.round(perf.score * 100)}/100`);
console.log('');

console.log('⚡ CORE WEB VITALS');
console.log(`LCP (Largest Contentful Paint): ${audits['largest-contentful-paint'].displayValue}`);
console.log(`TBT (Total Blocking Time): ${audits['total-blocking-time'].displayValue}`);
console.log(`CLS (Cumulative Layout Shift): ${audits['cumulative-layout-shift'].displayValue}`);
console.log('');

console.log('📈 MÉTRICAS ADICIONALES');
console.log(`FCP (First Contentful Paint): ${audits['first-contentful-paint'].displayValue}`);
console.log(`Speed Index: ${audits['speed-index'].displayValue}`);
console.log(`TTI (Time to Interactive): ${audits['interactive'].displayValue}`);
console.log('');

console.log('🔴 PROBLEMAS DETECTADOS\n');
const opportunities = Object.entries(audits)
    .filter(([, audit]) => audit.score !== null && audit.score < 0.9 && audit.details && audit.details.overallSavingsMs > 100)
    .sort((a, b) => (b[1].details?.overallSavingsMs || 0) - (a[1].details?.overallSavingsMs || 0))
    .slice(0, 5);

opportunities.forEach(([key, audit], i) => {
    console.log(`${i + 1}. ${audit.title}`);
    console.log(`   Ahorro potencial: ${audit.details.overallSavingsMs}ms`);
});
