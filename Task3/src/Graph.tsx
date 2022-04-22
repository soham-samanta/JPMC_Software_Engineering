import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      lower_bound: 'float',
      upper_bound: 'float',
      trigger_alert: 'float',
      timestamp: 'date',
    };

    /*
    ● Since we don’t want to distinguish between two stocks now, but instead want to track their
      ratios, we made sure to add the ratio field. Since we also wanted to track upper_bound,
      lower_bound, and the moment when these bounds are crossed i.e. trigger_alert, we had to
      add those fields too.
    ● Finally, the reason we added price_abc and price_def is just because these were necessary
       get the ratio as you will see later. We won’t be configuring the graph to show them anyway.
    ● Of course since we’re tracking all of this with respect to time, timestamp is going to be there
    */

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      // elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["top_ask_price"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        lower_bound: 'avg',
        upper_bound: 'avg',
        trigger_alert: 'avg',
        timestamp: 'distinct count',
      }));
    }
  }

  /* 
  ● ‘view’ is the the kind of graph we wanted to visualize the data as. Initially, this is
    already set to y_line. This is the type of graph we want so we’re good here.
  ● ‘column-pivots’ used to exist and was what allowed us to distinguish / split
    stock ABC with DEF back in task 2. We removed this because we’re concerned
    about the ratios between two stocks and not their separate prices
  ● ‘row-pivots’ takes care of our x-axis. This allows us to map each datapoint
    based on the timestamp it has. Without this, the x-axis is blank. So this field
    and its value remains
  ● ‘columns’ is what will allow us to only focus on a particular part of a datapoint’s
    data along the y-axis. Without this, the graph will plot all the fields and values of
    each datapoint and it will be a lot of noise. For this case, we want to track ratio,
    lower_bound, upper_bound and trigger_alert.
  ● ‘aggregates’ is what will allow us to handle the cases of duplicated data we
    observed way back in task 2 and consolidate them as just one data point. In
    our case we only want to consider a data point unique if it has a timestamp.
    Otherwise, we will average out the all the values of the other non-unique fields
    these ‘similar’ datapoints before treating them as one (e.g. ratio, price_abc, …)
  */

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

/* 
● To fully achieve our goal in this task, we have to make some modifications in
  the DataManipulator.ts file. This file will be responsible for processing the raw
  stock data we’ve received from the server before it throws it back to the Graph
  component’s table to render. Initially, it’s not really doing any processing hence
  we were able to keep the status quo from the finished product in task 2
● The first thing we have to modify in this file is the Row interface. If you notice,
  the initial setting of the Row interface is almost the same as the old schema in
  Graph.tsx before we updated it. So now, we have to update it to match the
  new schema. See next slide to better visualize the change that’s supposed to
  happen. 
*/

export default Graph;
