const VELOCITY = 300;

let stopped = false;

const goodColor = "#42b72a";
const warnColor = "#ffcc00";
const badColor = "#fa3e3e";

class Meeting extends React.Component {
  constructor() {
    super();
    this.state = {
      checked: {},
    };
    this._onClickCheckbox = this._onClickCheckbox.bind(this);
  }

  componentWillReceiveProps(props) {
    const checked = this.state.checked;
    props.agenda.items.forEach(item => {
      if (item.checked) {
        checked[item.name] = true;
      }
    });
    this.setState({checked});
  }

  render() {
    const totalHeight = this.props.totalHeight;
    const totalWidth = this.props.width;
    const title = this.props.agenda.title;

    const scheduledDuration = this.props.agenda.scheduledDuration;
    const elapsedMsReal = (this.props.currentTime - this.props.startTime);
    const velocity = this.props.velocity || 1; // speed things up
    const elapsedMs = elapsedMsReal * velocity;
    const scheduledDurationMs = scheduledDuration * 60 * 1000.0;
    const currentLineHeightReal = elapsedMs / scheduledDurationMs * totalHeight;
    const currentLineHeight = Math.round(currentLineHeightReal);

    const items = this.props.agenda.items;

    const isDone = this._allBoxesChecked();

    /**
     * Figure out the color and current line
     */
    // is the elapsedMs > the ms sum to the last checked item?
    let msSum = 0;
    for (let i = 0; i < items.length; i++) {
      msSum += items[i].duration * 60 * 1000;
      if (!this.state.checked[items[i].name]) {
        // no more summing -- in this last item.
        break;
      }
    }

    let currentLineColor = goodColor;
    if (isDone) {
      currentLineColor = goodColor;
    } else if (elapsedMs > msSum) {
      // stopped = true;
      currentLineColor = badColor;
    } else if (elapsedMs + 30000 > msSum) {
      currentLineColor = warnColor;
    }

    const currentLine = (
      <div style={{position: 'relative', width: totalWidth, borderBottom: '4px solid ' + currentLineColor, top: currentLineHeight, marginLeft: -10}} />
    );

    /**
     * Generate the items
     */
    const totalItemsDuration = items.reduce(function(t,x){return x.duration + t;}, 0);
    const itemList = items.map(item => {
      const currentItemMs = item.duration * 60 * 1000.0;
      const currentItemHeightReal = currentItemMs / scheduledDurationMs * totalHeight; // TODO: re-scale button?
      const currentItemHeight = Math.round(currentItemHeightReal);
      const name = item.name;
      return (
        <div
          key={name}
          style={{width: totalWidth - 1, borderBottom: '1px solid ' + currentLineColor, float: 'left', clear: 'both', height: currentItemHeight - 1}}>
          <input type="checkbox" data-name={name} onClick={this._onClickCheckbox} checked={this.state.checked[name]} />
          {name}
        </div>
      );
    });

    const meetingAchieved = isDone ? (
      <h3>Meeting Done! Thanks Everyone!</h3>
    ) : null;
    return (
      <div style={{position: 'relative', left: 10, width: totalWidth}}>
        <h2>{title}</h2>
        {meetingAchieved}
        {this._renderControls()}
        {currentLine}
        {itemList}
        <div style={{height: totalHeight, border: '1px solid ' + currentLineColor}}>
        </div>
      </div>
    );
  }

  _renderControls() {
    return (
      <div>
        <a href="#" onClick={this._onTogglePause}>[Start/Stop Timing]</a>
      </div>
    );
  }

  _allBoxesChecked() {
    return this.props.agenda.items.every(item => {
      return this.state.checked[item.name];
    });
  }

  _onClickCheckbox(ev) {
    const checked = this.state.checked;
    checked[ev.target.dataset['name']] = ev.target.checked;
    this.setState({checked});
  }

  _onTogglePause(ev) {
    stopped = !stopped;
    console.log(stopped);
  }
}



const agenda = window.WEEKLY_AGENDA;
// const EXAMPLE_AGENDA = {
//   title: 'Weekly Meeting',
//   start: '3pm',
//   scheduledDuration: 30, // min
//   items: [
//     {
//       name: 'Commencement',
//       checked: true,
//       duration: 1 // min
//     },
//     // ...
//   ],
// };

var start = new Date().getTime();
setInterval(() => {
  if (stopped) return;
  ReactDOM.render(
    <Meeting 
      startTime={start}
      currentTime={new Date().getTime()}
      totalHeight={800}
      velocity={VELOCITY}
      width={450}
      agenda={agenda}/>,
    document.getElementById('container'),
  );
}, 50);
