import { ServerRespond } from './DataStreamer';

export interface Row {
      price_abc: number,
      price_def: number,
      ratio: number,
      lower_bound: number,
      upper_bound: number,
      trigger_alert: number | undefined,
      timestamp: Date
}

/* 
● This change is necessary because it will be the structure of the return object of
  the only function of the DataManipulator class, i.e. the generateRow function
● It’s important that the return object corresponds to the the schema of the table
  we’ll be updating in the Graph component because that’s the only way that we’ll
  be able to display the right output we want. 
● Finally, we have to update the generateRow function of the DataManipulator
  class to properly process the raw server data passed to it so that it can return
  the processed data which will be rendered by the Graph component’s table.
● Here we can compute for price_abc and price_def properly (like what you did
  back in task 1). Afterwards we can also compute for ratio using the two
  computed prices, (like what you did in task 1 too). And, set lower and upper
  bounds, as well as trigger_alert. To better understand this see the expected
  change in the next slide
*/


export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
        const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price)/2;
        const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price)/2;
        const ratio = priceABC / priceDEF;
        const upper_bound = 1 + 0.07;
        const lower_bound = 1 - 0.07;
        return {
          price_abc: priceABC,
          price_def: priceDEF,
          ratio,
          timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ? 
            serverResponds[0].timestamp : serverResponds[1].timestamp,
          upper_bound: upper_bound,
          lower_bound: lower_bound,
          trigger_alert: (ratio > upper_bound || ratio < lower_bound ) ? ratio : undefined,
      };
    }
}


/*
● Observe how we’re able to access serverRespond as an array where in the
  first element (0-index) is about stock ABC and the second element (1-index) is
  about stock DEF. With this, we were able to easily just plug in values to the
  formulas we used back in task 1 to compute for prices and ratio properly
● Also note how the return value is changed from an array of Row objects to just
  a single Row object This change explains why we also adjusted the argument
  we passed to table.update in Graph.tsx earlier so that consistency is
  preserved.
● The upper_bound and lower_bound are pretty much constant for any data
  point. This is how we will be able to maintain them as steady upper and lower
  lines in the graph. While 1.05 and 0.95 isn’t really +/-10% of the 12 month
  historical average ratio (i.e. 1.1 and 0.99) you’re free to play around with the
  values and see which has a more conservative alerting behavior.
● The trigger_alert field is pretty much just a field that has a value (e.g. the ratio)
  if the threshold is passed by the ratio. Otherwise if the ratio remains within the
  threshold, then no value/undefined will suffice.
*/
