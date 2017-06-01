/* global d3:true */

import apijs from 'tnt.api';
import { schemePaired as color } from 'd3-scale-chromatic';

const config = {
  data: {},
  width: 800,
  height: 800,
};

const dispatch = d3.dispatch('click', 'dblclick', 'mouseover', 'mouseout', 'selected', 'unselected');

export default function () {
  const render = function (container) {
    const svg = d3.select(container)
      .append('svg')
      .attr('width', config.width)
      .attr('height', config.height)
      .append('g');

    const treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([config.width, config.height])
      .round(true)
      .paddingInner(1);

    treemap(config.data);

    const cell = svg.selectAll('g')
      .data(config.data.leaves())
      .enter().append('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    cell.append('rect')
      .attr('id', (d) => d.data.key)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('fill', (d, i) => color[i])
      .style('opacity', '0.3')
      .on('click', (d) => {
        console.log('clicked on ...');
        console.log(d);
        dispatch.call('click', this, d);
      });

    cell.append('clipPath')
      .attr('id', (d) => {
        return `clip-${d.data.key}`;
      })
      .append('use')
      .attr('xlink:href', (d) => `#${d.data.key}`);

    cell.append('text')
      .attr('clip-path', (d) => `url(#clip-${d.data.key})`)
      .style('font-size', '0.8em')
      .selectAll('tspan')
      .data((d) => d.data.key.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + (i * 10))
      .text((d) => d);

    cell.append('title')
      .text((d) => `${d.data.key}\n${d.data.doc_count}`);
  };

  apijs(render).getset(config);

  // return d3.rebind(render, dispatch, "on");
  render.on = function () {
    /* eslint prefer-spread: 0 */
    /* eslint prefer-rest-params: 0 */
    const value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? render : value;
  };

  return render;
}
