export const siteMotionGuidance = [
  'Motion system available: scroll reveal, staggered cards, lightweight parallax media, floating visual panels, sticky nav polish, and reduced-motion fallbacks.',
  'Use data-parallax="0.08" to data-parallax="0.18" on hero media or rich image panels. Avoid parallax on long text blocks.',
  'Use reveal/stagger motion to make sites feel richer, but keep interaction usable and respect prefers-reduced-motion.',
  'Recommended rich sections: full-bleed media, split hero with parallax image, bento feature grid, testimonial carousel, process timeline, gallery grid, CTA band, and animated proof stats.',
];

export function siteMotionSummary() {
  return siteMotionGuidance.join('\n');
}

export function siteMotionCss() {
  return `
.reveal{opacity:0;transform:translate3d(0,22px,0);transition:opacity .7s ease,transform .7s ease}
.reveal.is-visible{opacity:1;transform:none}
.stagger>*{transition-delay:calc(var(--stagger-index,0)*70ms)}
.parallax-media{will-change:transform;transform:translate3d(0,var(--parallax-offset,0px),0);transition:transform .08s linear}
.float-card{animation:microagency-float 7s ease-in-out infinite}
.depth-panel{position:relative;isolation:isolate;overflow:hidden}
.depth-panel:before{content:"";position:absolute;inset:auto -20% -35% -20%;height:58%;background:radial-gradient(circle at 50% 0,color-mix(in srgb,var(--accent) 34%,transparent),transparent 70%);z-index:-1;transform:translate3d(0,var(--parallax-soft,0px),0)}
.rich-media-band{position:relative;overflow:hidden;border-radius:var(--radius);min-height:clamp(260px,45vw,520px)}
.rich-media-band img{width:100%;height:100%;min-height:inherit;object-fit:cover;display:block;transform:scale(1.04)}
.rich-media-band:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.46))}
@keyframes microagency-float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .parallax-media,.depth-panel:before{transform:none!important;transition:none}
  .float-card{animation:none}
}
`;
}

export function siteMotionScript() {
  return `
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(fn){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn)}else{fn()}}
  ready(function(){
    var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.section,.hero,.card,.panel,.step,.media-strip,.contact'));
    revealTargets.forEach(function(el,index){
      if(!el.classList.contains('reveal')) el.classList.add('reveal');
      if(el.parentElement && (el.parentElement.classList.contains('grid') || el.parentElement.classList.contains('steps'))) {
        el.style.setProperty('--stagger-index', String(index % 8));
      }
    });
    if(reduceMotion){
      revealTargets.forEach(function(el){el.classList.add('is-visible')});
      return;
    }
    if('IntersectionObserver' in window){
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
      revealTargets.forEach(function(el){observer.observe(el)});
    } else {
      revealTargets.forEach(function(el){el.classList.add('is-visible')});
    }
    var parallaxTargets = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if(!parallaxTargets.length) return;
    var ticking = false;
    function updateParallax(){
      ticking = false;
      var vh = window.innerHeight || 1;
      parallaxTargets.forEach(function(el){
        var rect = el.getBoundingClientRect();
        if(rect.bottom < -120 || rect.top > vh + 120) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || .12;
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        var offset = Math.max(-48, Math.min(48, progress * speed * -220));
        el.style.setProperty('--parallax-offset', offset.toFixed(2) + 'px');
        el.style.setProperty('--parallax-soft', (offset * .45).toFixed(2) + 'px');
      });
    }
    function requestTick(){
      if(!ticking){
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }
    }
    updateParallax();
    window.addEventListener('scroll', requestTick, {passive:true});
    window.addEventListener('resize', requestTick);
  });
})();
`;
}
