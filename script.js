const educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const width = 960;
const height = 600;
const svg = d3.select("#map")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

const tooltip = d3.select("#tooltip");

Promise.all([
  d3.json(countyURL),
  d3.json(educationURL)
]).then(([countyData, educationData]) => {
  const counties = topojson.feature(countyData, countyData.objects.counties).features;
  const education = new Map(educationData.map(d => [d.fips, d]));

  const colorScale = d3.scaleThreshold()
.domain([10, 20, 30, 40]) 
.range(["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"]); 


  svg.append("g")
     .selectAll("path")
     .data(counties)
     .enter()
     .append("path")
     .attr("class", "county")
     .attr("d", d3.geoPath())
     .attr("data-fips", d => d.id)
     .attr("data-education", d => education.get(d.id)?.bachelorsOrHigher || 0)
     .attr("fill", d => colorScale(education.get(d.id)?.bachelorsOrHigher || 0))
     .on("mouseover", function(event, d) {
       const edu = education.get(d.id);
       tooltip.transition().style("opacity", 1);
       tooltip.html(`${edu?.area_name}, ${edu?.state}: ${edu?.bachelorsOrHigher}%`)
              .attr("data-education", edu?.bachelorsOrHigher || 0)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 28}px`);
     })
     .on("mouseout", function() {
       tooltip.transition().style("opacity", 0);
     });

  const legend = d3.select("#legend");
  const legendItems = ["<10%", "10-20%", "20-30%", "30-40%", ">40%"];

  legend.selectAll(".legend-item")
        .data(colorScale.range())
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .each(function(d, i) {
          const item = d3.select(this);
          item.append("div").attr("class", "legend-color").style("background-color", d);
          item.append("span").text(legendItems[i]);
        });
}).catch(err => console.error(err));