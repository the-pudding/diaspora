/* eslint-disable func-names */
/* eslint-disable prettier/prettier */
/* global d3 */

let $svgContainer;
let $svg;

let $sidebar;
let $sidebarList;
let sidebarItemsJoin;
let $sidebarItems;

function animateIntro(){

}

function setupSidebar(countries){
    sidebarItemsJoin = $sidebarList
        .selectAll('li')
        .data(countries)
        .enter()
    
    $sidebarItems = sidebarItemsJoin
        .append('li') 

    $sidebarItems
        .attr('class',function(d){
            return d.name.toLowerCase() +' country-btn'
        })
        .text(d=> d.name.replace(/_/g, ' '))
}

function setupDOM(rawData){
    $svgContainer=d3.select('.explore__map-container')
        .append('div')
        .attr('class','svg-shell')
            

    $svg = $svgContainer
        .append('svg')
        .attr('class', 'instability svg-instability')

    $svg.attr('width', function(){
        return (d3.select('.explore__map-container').node().offsetWidth)
    });

    $svg.attr('height', function(){
        return (d3.select('.explore__map-container').node().offsetHeight)
    });

    $sidebar = d3.select('.explore__nav-bar');
    $sidebarList = $sidebar.append('ul');
    setupSidebar(rawData);
    
}

function animateIntro(rawData) {
    
    const data = rawData.sort(function(a, b){return a - b});
    let i=0;
    
    setInterval(function(){
        const $selectedText = d3.select('.country-hed')
        const currentName = $selectedText.text()
        const newNameRaw = data[i].name;
        const newNameEdited = newNameRaw.replace(/_/g, ' ')

        d3.select('.intro__right').style('background',()=>{
            const style = `linear-gradient(rgba(145,144,186,0.8), rgba(145,144,186,0.8)), url("../assets/images/${newNameRaw}.png")`
            return style
        })

        $selectedText.text(newNameEdited)            
        i++
    }, 1000);

    return rawData;
}

function resize() {

}

function drawMap(us){

    // const projection = d3.geoAlbers();

    const projection = d3.geoAlbers()
        .translate([0, 0]) 
        .scale([100])
        .rotate([0, 0])
        .parallels([29.5, 45.5]); 

    const path = d3.geoPath(projection);

    let corners = {
        tl: [-129.2564141943848, 48.153946283439424],
        bl: [-129.2564141943848, 22.966363869103986],
        tr: [-74.2681980247622, 48.153946283439424],
        br: [-74.2681980247622, 22.966363869103986]
      }
      
      function coordsToGeoJson(coords) {
        coords.push(coords[0]); // last coord needs to be the same as the first to be valid
        return {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [ coords ]
          },
          "properties": { "id": "bbox" },
        }
      }
      
    let basemapBounds = coordsToGeoJson([corners.tl, corners.tr, corners.br, corners.bl]);


    let width, height;
    width = $svgContainer.node().getBoundingClientRect().width;
    height = $svgContainer.node().getBoundingClientRect().height;
    
   
    const imageWidth = 4467
    const imageHeight = 3087
    
    let trueHeight, trueWidth;

    if (height / width > imageHeight / imageWidth) {
        trueHeight = height;
        trueWidth = height * (imageWidth / imageHeight);
      } else {
        trueWidth = width;
        trueHeight = width / (imageWidth / imageHeight);
      }
    
    var padding = 1;
    
    let centroid = [-96, 37.5],//d3.geoCentroid(basemapBounds),
    rotation_target = -centroid[0];
    
    projection
        .scale(1)
        .center([0, centroid[1]])
        .translate([0,0])
        .rotate([rotation_target,0]);
    
    let currentBounds = path.bounds(basemapBounds);
    let currentWidth = currentBounds[1][0] - currentBounds[0][0];
    let currentHeight = currentBounds[1][1] - currentBounds[0][1];
    
    
    let s = padding / (currentWidth / trueWidth),
        t = [
            ((trueWidth - s * (currentBounds[1][0] + currentBounds[0][0])) / 2) - ((trueWidth - width) / 2), 
            ((trueHeight - s * 1.01 * (currentBounds[1][1] + currentBounds[0][1])) / 2) - ((trueHeight - height) / 2) - 9
        ];
  
    projection
        .center([0, centroid[1]])
        .scale(s)
        .translate(1000);


    $svg.append('g')
        .attr('class', 'states')
        .selectAll('path')
        .data(topojson.feature(us, us.objects.states).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class','state')
        .style('fill','#3c3b6e')


}


function init() {

    d3.csv("/assets/data/country_names.csv")
    // .then(rawData=>animateIntro(rawData))
    .then(rawData=>setupDOM(rawData))
    .then(resize);

    d3.json("/assets/data/us-states.json")
    .then(states=> drawMap(states))
    // setupDOM();


}

export default { init, resize };
