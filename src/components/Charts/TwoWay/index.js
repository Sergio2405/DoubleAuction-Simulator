import { useD3 } from '../../../hooks/useD3.js';
import * as d3 from 'd3';

import './style.scss'

const TwoWay = ({ title , data }) => {
    const ref = useD3(
        (svg) => {
          const height = 330;
          const width = 500;
          const margin = { top: 20, right: 10, bottom: 10, left: 25 };
    
          const x = d3.scaleBand()
                      .domain(data
                                .sort((obs1,obs2) => d3.ascending(obs1.quantity, obs2.quantity))
                                .map((d) => d.quantity))
                      .range([margin.left, width - margin.right])

          const y = d3.scaleLinear()
                      .domain([0, d3.max(data, (d) => d.price)])
                      .range([height - margin.bottom, margin.top]);
    
          const xAxis = (g) =>
            g.attr("transform", `translate(0,${height - margin.bottom})`).call(
              d3.axisBottom(x)
            );
    
          const yAxis = (g) =>
            g.attr("transform", `translate(${margin.left},0)`)
            .style("color", "steelblue")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .call((g) => g.select(".domain").remove())
            .call((g) => g.append("text")
                          .attr("x", -margin.left)
                          .attr("y", 10)
                          .attr("fill", "currentColor")
                          .attr("text-anchor", "start")
            );

          svg.attr("width", width )
            .attr("height", height + margin.bottom)
    
          svg.select(".x-axis").call(xAxis);
          svg.select(".y-axis").call(yAxis);

          const line = d3.line()
                    .x(d => x(d.quantity))
                    .y(d => y(d.price))
    
          svg.select(".supply")
            .datum(data.filter(obs => obs.curve == "supply"))
            .attr("d", line)
            .attr("fill","none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", "1.5")
            .attr("stroke-miterlimit", "1")

            svg.select(".demand")
            .datum(data.filter(obs => obs.curve == "demand"))
            .attr("d", line)
            .attr("fill","none")
            .attr("stroke", "red")
            .attr("stroke-width", "1.5")
            .attr("stroke-miterlimit", "1")
        },
        [data.length]);
    
      return (
        <div className = "Serie">
          <div className = "caption">{title}</div>
          <svg ref={ref}>
            <path className = "supply"/>
            <path className = "demand"/>
            <g className="x-axis" />
            <g className="y-axis" />
          </svg>
        </div>
      );
}

export default TwoWay