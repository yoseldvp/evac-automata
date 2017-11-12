import React, { Component } from 'react';
import { Button, Sidebar } from '../navigation';

import { select } from 'd3-selection'
import 'd3-selection-multi'
import 'd3-shape';
import 'd3-path';
import { scaleLinear } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';

import './Automata.css';

import { Model } from './Model';
import CONFIG from '../../automata.json';

const colors = interpolateSpectral;
const scale = scaleLinear()
                .domain([0, 5])
                .range([0, 1]);

export class Automata extends Component {
  constructor(props) {
    super(props);
    const model = new Model(this.props.width, this.props.height, CONFIG.defaults.layers, Model.randomGrid(this.props.width, this.props.height, CONFIG.defaults.layers.length)); 
    this.state = { model: model };
  }

  render() {
    return (
      <div>
        <Sidebar>
          <Button name='pause-circle-o' click={ this.pause } text='Pause' />
          <Button name='pencil-square-o' text='Edit' />
          <Button name='question' text='About' />
          <Button name='book' text='References' />
        </Sidebar>
        <div className="base-layer"></div>
      </div>
    );
  }

  pause () {
    console.log('sdadasdasdasdasdasd');
    console.log(this);
    this.setState(Object.assign(this.state, { paused: true }));
  }

  draw() {
    const cellSize = this.props.cellSize;
    let context = this.state.context; 
    if (!context) {
      const base = select('.base-layer');
      const view = base.append('canvas')
        .attr('width', this.props.width * this.props.cellSize)
        .attr('height', this.props.height * this.props.cellSize);
      if (!view.node()) {
        return;
      }
      context = view.node().getContext('2d');
      this.setState({ model: this.state.model, context: context });
    }
    this.state.model._grid.forEach((cells, row) => {
      cells.forEach((cell, col) => {
        context.beginPath();
        context.arc(cellSize * (cell.col + 0.5), cellSize * (cell.row + 0.5), cellSize / 2, 0, 2 * Math.PI);
        let color;
        if (cell.value > this.state.model.layerCount) {
          color = '#c00';
        } else if (cell.value === 0) {
          color = '#141219'
        } else if (cell.value < 0) {
          color = '#fff'
        } else { 
          color = colors(scale(cell.value));
        }
        context.fillStyle = color;
        context.strokeStyle = '#29272D';
        context.lineWidth = 1;
        context.fill();
        context.stroke();
        context.closePath();
      });
    });
  }

  componentDidMount() {
    this.draw();
    setInterval(() => {
      if (this.state.paused) { 
        return;
      }
      const nextState = this.state.model.evolve();
      this.setState({ model: nextState, canvas: this.state.canvas });
      this.draw();
    }, 60);
  }
}
