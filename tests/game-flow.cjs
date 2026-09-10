const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
// Minimal document adapter: validate state transitions independently of a browser.
const nodes = new Map();
function element(key) {
 if (!nodes.has(key)) nodes.set(key, {innerHTML:'',textContent:'',style:{},dataset:{},classList:{add(){},remove(){}},querySelectorAll(){return [];},querySelector(s){return element(s);},showModal(){this.open=true;},close(){this.open=false;},scrollIntoView(){}});
 return nodes.get(key);
}
const context=vm.createContext({document:{getElementById:element,querySelectorAll(){return[];}},setTimeout(fn){fn();}});
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),context);
function run(code){return vm.runInContext(code,context);}
assert.equal(run('missions.length'),10);
run('visit(2)');assert.equal(run('current'),-1,'Locked location cannot open');
run('visit(0)');assert.equal(run('current'),0);
run('answer(0,1)');assert.equal(run('progress'),0,'Wrong answer cannot advance');assert.equal(run('score'),0);
run('showQuestion(0);answer(0,0)');assert.equal(run('progress'),1);assert.equal(run('score'),0,'Retry earns no points');
for(let i=1;i<10;i++)run(`showQuestion(${i});answer(${i},missions[${i}].answer)`);
assert.equal(run('score'),90);assert.equal(run('progress'),10);
run('showResults()');assert.match(element('dialog-content').innerHTML,/90/);
run('showAll()');assert.match(element('dialog-content').innerHTML,/HOW/);
run('restart()');assert.equal(run('score'),0);assert.equal(run('progress'),0);assert.equal(run('attempted.size'),0);
for(let i=0;i<10;i++)run(`showQuestion(${i});answer(${i},missions[${i}].answer)`);
assert.equal(run('score'),100);assert.equal(run('correctFirst.length'),10);
for(const filename of ['index.html','game.js','styles.css','office.png'])assert.ok(fs.statSync('dist/'+filename).size>0);
console.log('PASS: locked stages, incorrect answers, retry scoring, 10-stage completion, answer review, restart, perfect score, local assets.');

