const { extractText } = require('./services/documentParser');
const { runLocalATSEngine } = require('./services/localAtsEngineService');

(async () => {
    try {
        console.log('Testing extraction...');
        const text = await extractText('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        console.log('Text extracted:', text);

        console.log('Testing logic...');
        const result = runLocalATSEngine(text, 'Developer');
        console.log('Result:', result);
    } catch (e) {
        console.error('CRASH DETECTED:', e);
    }
})();
