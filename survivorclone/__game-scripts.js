var PlayerController=pc.createScript("playerController");const MAX_FROM_CENTER=14;PlayerController.prototype.initialize=function(){this.moveSpeed=5,this.health=100,this.xp=0,this.costume=this.entity.findByName("Costume"),this.worldcenter=new pc.Vec3(0,0,0),this.healthbar=this.entity.findByName("HealthFill"),this.healthbar.setLocalScale(1,1,1)},PlayerController.prototype.addXP=function(e){console.log("ADD XP",e)},PlayerController.prototype.damage=function(e){this.health<=0||(this.health-=e,this.healthbar.setLocalScale(Math.max(0,Math.min(1,this.health/100)),1,1),this.app.fire("PlayerController:damage",{entity:this.entity,value:e}),this.health<=0&&(this.costume.anim.setBoolean("dead",!0),this.app.fire("PlayerController:dead",{entity:this.entity,value:e})))},PlayerController.prototype.update=function(e){if(this.health<=0)return;let t=0,i=0;(this.app.keyboard.isPressed(pc.KEY_LEFT)||this.app.keyboard.isPressed(pc.KEY_A))&&(t=-1),(this.app.keyboard.isPressed(pc.KEY_RIGHT)||this.app.keyboard.isPressed(pc.KEY_D))&&(t+=1),(this.app.keyboard.isPressed(pc.KEY_DOWN)||this.app.keyboard.isPressed(pc.KEY_S))&&(i+=1),(this.app.keyboard.isPressed(pc.KEY_UP)||this.app.keyboard.isPressed(pc.KEY_W))&&(i-=1);const s=t*this.moveSpeed*e,a=i*this.moveSpeed*e,o=this.entity.getPosition();let n=new pc.Vec3(o.x+s,o.y,o.z+a);(new pc.Vec3).distance(n)>14&&(n=n.normalize().mulScalar(14)),this.entity.setPosition(n);const r=this.costume.anim.getBoolean("running");0!=s||0!=a?(r||this.costume.anim.setBoolean("running",!0),this.costume.lookAt(this.entity.getPosition().add(new pc.Vec3(-s,0,-a)))):r&&this.costume.anim.setBoolean("running",!1)};var CameraController=pc.createScript("cameraController");CameraController.prototype.initialize=function(t,i,o){this.player=this.app.root.findByName("Hero")},CameraController.prototype.update=function(t){this.entity.setPosition(this.player.position.x,this.player.position.y+15,this.player.position.z+15),this.entity.lookAt(this.player.position.x,this.player.position.y,this.player.position.z)};var GameController=pc.createScript("gameController");GameController.prototype.initialize=function(){},GameController.prototype.update=function(t){},GameController.prototype.spawnBullet=function(t,e,o){var r=this.app.assets.get("164453980").resource.instantiate();this.app.root.addChild(r)};var Bullet=pc.createScript("bullet");Bullet.attributes.add("speed",{type:"number",default:10}),Bullet.attributes.add("damage",{type:"number",default:10}),Bullet.prototype.initialize=function(){this.alive=0,this.entity.collision.on("triggerenter",this.onTriggerEnter,this)},Bullet.prototype.update=function(t){this.entity.translateLocal(0,0,-this.speed*t),this.alive+=t,this.alive>5&&this.entity.destroy()},Bullet.prototype.onTriggerEnter=function(t){t&&t.tags.has("enemy")&&t.script.enemyObject.damage(this.damage)};var DamageDisplayManager=pc.createScript("damageDisplayManager");DamageDisplayManager.prototype.initialize=function(){for(this._counterPool=[];this._counterPool.length<20;){var t=this.app.assets.get("164459124").resource.instantiate();t.enabled=!1,this.app.root.addChild(t),this._counterPool.push(t)}this.app.on("EnemyController:damage",(({entity:t,value:o})=>{this.display(t.getPosition(),o,pc.Color.YELLOW)}),this),this.app.on("PlayerController:damage",(({entity:t,value:o})=>{this.display(t.getPosition(),o,pc.Color.RED)}),this),this.app.on("PlayerController:dead",(({entity:t,value:o})=>{this.display(t.getPosition(),"DEAD",pc.Color.RED)}),this),this.app.on("PlayerController:xp",(({entity:t,value:o})=>{this.display(t.getPosition(),o,pc.Color.CYAN)}),this)},DamageDisplayManager.prototype.display=function(t,o,e){for(let i=0;i<this._counterPool.length;i++)if(!this._counterPool[i].enabled){this._counterPool[i].setPosition(t.x,t.y+3.5,t.z),this._counterPool[i].element.text=o,this._counterPool[i].element.color=e,this._counterPool[i].element.opacity=1,this._counterPool[i].enabled=!0;break}},DamageDisplayManager.prototype.update=function(t){for(let o=0;o<this._counterPool.length;o++)if(this._counterPool[o].enabled){this._counterPool[o].element.opacity-=t;const e=this._counterPool[o].getPosition();e.y+=3*t,this._counterPool[o].setPosition(e.x,e.y,e.z),this._counterPool[o].element.opacity<0&&(this._counterPool[o].enabled=!1)}};var EnemyObject=pc.createScript("enemyObject");EnemyObject.attributes.add("attackRange",{type:"number",default:2}),EnemyObject.prototype.initialize=function(){this.player=this.app.root.findByName("Hero"),this.speed=2,this.health=20,this.attackDelay=1,this.lastAttack=0,this.app.on("PlayerController:dead",(({entity:t,value:e})=>{this.playerDead=!0}),this)},EnemyObject.prototype.update=function(t){if(this.playerDead){const e=this.entity.getPosition(),i=e.normalize(),a=this.speed*t*3,s=e.clone().mul(new pc.Vec3(30,1,30)).add(i);return this.entity.lookAt(s.x,0,s.z),this.entity.translateLocal(0,0,-a),void((new pc.Vec3).distance(this.entity.getPosition())>30&&this.entity.destroy())}const e=this.entity.getPosition(),i=this.player.getPosition(),a=e.distance(i);if(this.lastAttack+=t,this.entity.lookAt(this.player.position.x,0,this.player.position.z),a>this.attackRange){let e=this.speed*t;a>10?e*=2:e=a/10*this.speed*t,this.entity.translateLocal(0,0,-e)}else this.lastAttack>=this.attackDelay&&(this.lastAttack=0,this.player.script.playerController.damage(2))},EnemyObject.prototype.damage=function(t){this.health-=t,this.app.fire("EnemyController:damage",{entity:this.entity,value:t}),this.health<=0&&(this.app.fire("EnemyController:dead",{entity:this.entity,value:t}),this.entity.destroy())};var EnemyController=pc.createScript("enemyController");const ENEMIES=["164236620","164676329","164676330","164676331"],SPAWN_DISTANCE=15;EnemyController.prototype.initialize=function(){this.player=this.app.root.findByName("Hero"),this.enemySpawnDelay=5,this.enemySpawnLast=0,this.app.on("PlayerController:dead",(({entity:t,value:e})=>{this.playerdead=!0}),this)},EnemyController.prototype.update=function(t){this.playerdead||(this.enemySpawnLast+=t,this.enemySpawnLast>this.enemySpawnDelay&&this.spawnEnemy(),this.enemySpawnDelay=Math.max(.1,this.enemySpawnDelay-t))},EnemyController.prototype.spawnEnemy=function(){this.enemySpawnLast=0;var t=this.app.assets.get(ENEMIES[Math.floor(Math.random()*ENEMIES.length)]).resource.instantiate();const e=360*Math.random(),a=this.player.getPosition(),n=a.x+15*Math.cos(pc.math.DEG_TO_RAD*e),o=a.z+15*Math.sin(pc.math.DEG_TO_RAD*e);t.setPosition(n,a.y,o),this.app.root.addChild(t)};var XpBubble=pc.createScript("xpBubble");XpBubble.attributes.add("xp",{type:"number",default:2}),XpBubble.prototype.initialize=function(){this.player=this.app.root.findByName("Hero"),this.entity.collision.on("triggerenter",this.onTriggerEnter,this)},XpBubble.prototype.update=function(t){const e=this.player.getPosition();this._attracted?(this.entity.lookAt(e.x,0,e.z),this.entity.translateLocal(0,0,-10*t)):this.entity.position.distance(e)<6&&(this._attracted=!0)},XpBubble.prototype.reset=function(){this._attracted=!1},XpBubble.prototype.onTriggerEnter=function(t){t&&t.tags.has("hero")&&(t.script.playerController.addXP(this.xp),this.app.fire("PlayerController:xp",{entity:this.entity,value:this.xp}),this.entity.destroy())};"undefined"!=typeof document&&(
/*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
function(t,e){function s(t,e){for(var n in e)try{t.style[n]=e[n]}catch(t){}return t}function H(t){return null==t?String(t):"object"==typeof t||"function"==typeof t?Object.prototype.toString.call(t).match(/\s([a-z]+)/i)[1].toLowerCase()||"object":typeof t}function R(t,e){if("array"!==H(e))return-1;if(e.indexOf)return e.indexOf(t);for(var n=0,o=e.length;n<o;n++)if(e[n]===t)return n;return-1}function I(){var t,e=arguments;for(t in e[1])if(e[1].hasOwnProperty(t))switch(H(e[1][t])){case"object":e[0][t]=I({},e[0][t],e[1][t]);break;case"array":e[0][t]=e[1][t].slice(0);break;default:e[0][t]=e[1][t]}return 2<e.length?I.apply(null,[e[0]].concat(Array.prototype.slice.call(e,2))):e[0]}function N(t){return 1===(t=Math.round(255*t).toString(16)).length?"0"+t:t}function S(t,e,n,o){t.addEventListener?t[o?"removeEventListener":"addEventListener"](e,n,!1):t.attachEvent&&t[o?"detachEvent":"attachEvent"]("on"+e,n)}function D(t,e){function g(t,e,n,o){return h[0|t][Math.round(Math.min((e-n)/(o-n)*M,M))]}function r(){F.legend.fps!==q&&(F.legend.fps=q,F.legend[c]=q?"FPS":"ms"),b=q?v.fps:v.duration,F.count[c]=999<b?"999+":b.toFixed(99<b?0:O.decimals)}function m(){for(l=n(),P<l-O.threshold&&(v.fps-=v.fps/Math.max(1,60*O.smoothing/O.interval),v.duration=1e3/v.fps),w=O.history;w--;)T[w]=0===w?v.fps:T[w-1],j[w]=0===w?v.duration:j[w-1];if(r(),O.heat){if(z.length)for(w=z.length;w--;)z[w].el.style[o[z[w].name].heatOn]=q?g(o[z[w].name].heatmap,v.fps,0,O.maxFps):g(o[z[w].name].heatmap,v.duration,O.threshold,0);if(F.graph&&o.column.heatOn)for(w=C.length;w--;)C[w].style[o.column.heatOn]=q?g(o.column.heatmap,T[w],0,O.maxFps):g(o.column.heatmap,j[w],O.threshold,0)}if(F.graph)for(y=0;y<O.history;y++)C[y].style.height=(q?T[y]?Math.round(x/O.maxFps*Math.min(T[y],O.maxFps)):0:j[y]?Math.round(x/O.threshold*Math.min(j[y],O.threshold)):0)+"px"}function k(){20>O.interval?(p=i(k),m()):(p=setTimeout(k,O.interval),f=i(m))}function G(t){(t=t||window.event).preventDefault?(t.preventDefault(),t.stopPropagation()):(t.returnValue=!1,t.cancelBubble=!0),v.toggle()}function U(){O.toggleOn&&S(F.container,O.toggleOn,G,1),t.removeChild(F.container)}function V(){if(F.container&&U(),o=D.theme[O.theme],!(h=o.compiledHeatmaps||[]).length&&o.heatmaps.length){for(y=0;y<o.heatmaps.length;y++)for(h[y]=[],w=0;w<=M;w++){var e,n=h[y],a=w;e=.33/M*w;var i=o.heatmaps[y].saturation,l=o.heatmaps[y].lightness,p=void 0,c=void 0,u=void 0,d=u=void 0,f=p=c=void 0;f=void 0;0===(u=.5>=l?l*(1+i):l+i-l*i)?e="#000":(c=(u-(d=2*l-u))/u,f=(e*=6)-(p=Math.floor(e)),f*=u*c,0===p||6===p?(p=u,c=d+f,u=d):1===p?(p=u-f,c=u,u=d):2===p?(p=d,c=u,u=d+f):3===p?(p=d,c=u-f):4===p?(p=d+f,c=d):(p=u,c=d,u-=f),e="#"+N(p)+N(c)+N(u)),n[a]=e}o.compiledHeatmaps=h}for(var b in F.container=s(document.createElement("div"),o.container),F.count=F.container.appendChild(s(document.createElement("div"),o.count)),F.legend=F.container.appendChild(s(document.createElement("div"),o.legend)),F.graph=O.graph?F.container.appendChild(s(document.createElement("div"),o.graph)):0,z.length=0,F)F[b]&&o[b].heatOn&&z.push({name:b,el:F[b]});if(C.length=0,F.graph)for(F.graph.style.width=O.history*o.column.width+(O.history-1)*o.column.spacing+"px",w=0;w<O.history;w++)C[w]=F.graph.appendChild(s(document.createElement("div"),o.column)),C[w].style.position="absolute",C[w].style.bottom=0,C[w].style.right=w*o.column.width+w*o.column.spacing+"px",C[w].style.width=o.column.width+"px",C[w].style.height="0px";s(F.container,O),r(),t.appendChild(F.container),F.graph&&(x=F.graph.clientHeight),O.toggleOn&&("click"===O.toggleOn&&(F.container.style.cursor="pointer"),S(F.container,O.toggleOn,G))}"object"===H(t)&&undefined===t.nodeType&&(e=t,t=document.body),t||(t=document.body);var o,h,l,p,f,x,b,w,y,v=this,O=I({},D.defaults,e||{}),F={},C=[],M=100,z=[],E=O.threshold,A=0,P=n()-E,T=[],j=[],q="fps"===O.show;v.options=O,v.fps=0,v.duration=0,v.isPaused=0,v.tickStart=function(){A=n()},v.tick=function(){l=n(),E+=(l-P-E)/O.smoothing,v.fps=1e3/E,v.duration=A<P?E:l-A,P=l},v.pause=function(){return p&&(v.isPaused=1,clearTimeout(p),a(p),a(f),p=f=0),v},v.resume=function(){return p||(v.isPaused=0,k()),v},v.set=function(t,e){return O[t]=e,q="fps"===O.show,-1!==R(t,u)&&V(),-1!==R(t,d)&&s(F.container,O),v},v.showDuration=function(){return v.set("show","ms"),v},v.showFps=function(){return v.set("show","fps"),v},v.toggle=function(){return v.set("show",q?"ms":"fps"),v},v.hide=function(){return v.pause(),F.container.style.display="none",v},v.show=function(){return v.resume(),F.container.style.display="block",v},v.destroy=function(){v.pause(),U(),v.tick=v.tickStart=function(){}},V(),k()}var n,o=t.performance;n=o&&(o.now||o.webkitNow)?o[o.now?"now":"webkitNow"].bind(o):function(){return+new Date};for(var a=t.cancelAnimationFrame||t.cancelRequestAnimationFrame,i=t.requestAnimationFrame,h=0,l=0,p=(o=["moz","webkit","o"]).length;l<p&&!a;++l)i=(a=t[o[l]+"CancelAnimationFrame"]||t[o[l]+"CancelRequestAnimationFrame"])&&t[o[l]+"RequestAnimationFrame"];a||(i=function(e){var o=n(),a=Math.max(0,16-(o-h));return h=o+a,t.setTimeout((function(){e(o+a)}),a)},a=function(t){clearTimeout(t)});var c="string"===H(document.createElement("div").textContent)?"textContent":"innerText";D.extend=I,window.FPSMeter=D,D.defaults={interval:100,smoothing:10,show:"fps",toggleOn:"click",decimals:1,maxFps:60,threshold:100,position:"absolute",zIndex:10,left:"5px",top:"5px",right:"auto",bottom:"auto",margin:"0 0 0 0",theme:"dark",heat:0,graph:0,history:20};var u=["toggleOn","theme","heat","graph","history"],d="position zIndex left top right bottom margin".split(" ")}(window),function(t,e){e.theme={};var n=e.theme.base={heatmaps:[],container:{heatOn:null,heatmap:null,padding:"5px",minWidth:"95px",height:"30px",lineHeight:"30px",textAlign:"right",textShadow:"none"},count:{heatOn:null,heatmap:null,position:"absolute",top:0,right:0,padding:"5px 10px",height:"30px",fontSize:"24px",fontFamily:"Consolas, Andale Mono, monospace",zIndex:2},legend:{heatOn:null,heatmap:null,position:"absolute",top:0,left:0,padding:"5px 10px",height:"30px",fontSize:"12px",lineHeight:"32px",fontFamily:"sans-serif",textAlign:"left",zIndex:2},graph:{heatOn:null,heatmap:null,position:"relative",boxSizing:"padding-box",MozBoxSizing:"padding-box",height:"100%",zIndex:1},column:{width:4,spacing:1,heatOn:null,heatmap:null}};e.theme.dark=e.extend({},n,{heatmaps:[{saturation:.8,lightness:.8}],container:{background:"#222",color:"#fff",border:"1px solid #1a1a1a",textShadow:"1px 1px 0 #222"},count:{heatOn:"color"},column:{background:"#3f3f3f"}}),e.theme.light=e.extend({},n,{heatmaps:[{saturation:.5,lightness:.5}],container:{color:"#666",background:"#fff",textShadow:"1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},count:{heatOn:"color"},column:{background:"#eaeaea"}}),e.theme.colorful=e.extend({},n,{heatmaps:[{saturation:.5,lightness:.6}],container:{heatOn:"backgroundColor",background:"#888",color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.2)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},column:{background:"#777",backgroundColor:"rgba(0,0,0,.2)"}}),e.theme.transparent=e.extend({},n,{heatmaps:[{saturation:.8,lightness:.5}],container:{padding:0,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.5)"},count:{padding:"0 5px",height:"40px",lineHeight:"40px"},legend:{padding:"0 5px",height:"40px",lineHeight:"42px"},graph:{height:"40px"},column:{width:5,background:"#999",heatOn:"backgroundColor",opacity:.5}})}(window,FPSMeter));var Fps=pc.createScript("fps");Fps.prototype.initialize=function(){this.fps=new FPSMeter({heat:!0,graph:!0})},Fps.prototype.update=function(t){this.fps.tick()};var HeroWeaponTwo=pc.createScript("heroWeaponTwo");HeroWeaponTwo.prototype.initialize=function(){this.angle=0,this.damage=20,this.balls=this.entity.find("name","ball"),this.balls.forEach((e=>{e.collision.on("triggerenter",this.handleTriggerEnter,this)})),this.balls[0].enabled=!0},HeroWeaponTwo.prototype.handleTriggerEnter=function(e){e&&e.tags.has("enemy")&&e.script.enemyObject.damage(this.damage)},HeroWeaponTwo.prototype.update=function(e){this.angle+=180*e,this.entity.setEulerAngles(0,this.angle,0)};var XpBubbleManager=pc.createScript("xpBubbleManager");XpBubbleManager.prototype.initialize=function(){for(this.xpPool=[],this.xpTemplate=this.app.assets.get("164700344");this.xpPool<25;)this.createXPBubble();this.app.on("EnemyController:dead",(({entity:e,value:t})=>{this.spawnXPBubble(e.getPosition())}),this)},XpBubbleManager.prototype.update=function(e){},XpBubbleManager.prototype.spawnXPBubble=function(e){let t=this.xpPool.find((e=>!e.enabled))||this.createXPBubble();t.setPosition(e.x,e.y,e.z),console.log(t),t.script.xpBubble.reset(),t.enabled=!0},XpBubbleManager.prototype.createXPBubble=function(){var e=this.xpTemplate.resource.instantiate();return e.enabled=!1,this.xpPool.push(e),this.app.root.addChild(e),e};var HeroWeaponOne=pc.createScript("heroWeaponOne");HeroWeaponOne.prototype.initialize=function(){this.fireDelay=.5,this.fireLast=0,this.bulletTemplate=this.app.assets.get("164453980")},HeroWeaponOne.prototype.update=function(e){this.fireLast+=e,this.fireLast>=this.fireDelay&&this.fire()},HeroWeaponOne.prototype.fire=function(){this.fireLast=0;const e=this.entity.getPosition();for(let i=0;i<360;i+=36){var t=this.bulletTemplate.resource.instantiate();t.setPosition(e.x,e.y+1,e.z),t.setEulerAngles(0,i,0),this.app.root.addChild(t)}};var Billboard=pc.createScript("billboard");Billboard.prototype.initialize=function(){this.camera=this.app.root.findByName("Camera")},Billboard.prototype.update=function(t){this.entity.setRotation(this.camera.getRotation())};