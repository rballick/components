import React, {Component} from 'react';
import moment from 'moment';
//import Promise from 'bluebird';

import './Datepicker.css';
import './Popover.css';
import './Spinner.css';

function setProps(passedProps,defaultProps={},isComponent=false) {
	delete passedProps.children;
	for (const prop in passedProps) {
		switch (prop) {
			case 'style':
				defaultProps.style = typeof defaultProps.style === 'undefined' ? passedProps.style : {...defaultProps.style,...passedProps.style};
			break;
			case 'className':
				defaultProps.className = typeof defaultProps[prop] === 'undefined' ? passedProps.className : `${defaultProps.className} ${passedProps.className}`;
			break;
			default:
				if (isComponent || typeof passedProps[prop] !== 'function') defaultProps[prop] = passedProps[prop];
			break;
		}
	}
	
	return defaultProps;
}

function convertToPx(size) {
	if (!isNaN(size)) return size;
	return Number(size.replace('px',''));
}

function getRGBA(color,opacity = '1') {
	if (color.search(/rgba?\(/) === -1) {
		const e = document.createElement('div');
		e.style.background = color;
		document.body.prepend(e);
		color = window.getComputedStyle(e,null).getPropertyValue('background-color');
		document.body.removeChild(e);
	}
	const matches = color.match(/\d+/g);
	if(matches.length < 4) {
		matches.push(opacity);
		color = `rgba(${matches.join(',')})`;
	}
	return color;
}

class Nav extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active: this.props.active || 0
		};
	}
	
	render() {
		const type = this.props.type || 'tab';
		const bgColor = this.props.bgcolor || 'white';
		const borderColor = this.props.bordercolor || 'grey';
		let disabled = this.props.disabled || [];
		if (typeof disabled !== 'object') disabled = [Number(disabled)];
		const ulStyle = {
			display:'flex',
			flexDirection: this.props.stacked ? 'column' : 'row',
			listStyleType:'none',
			margin:'0',
			padding:'0',
		}
		
		const liStyle = {cursor: 'pointer'};
		const disabledStyle = {opacity:'.5',cursor:'default'};
		let activeStyle, inactiveStyle;		
		switch (type) {
			case 'tab':
				Object.assign(liStyle,{
					marginBottom: '-1px',
				});
				activeStyle = {padding:'3px 6px', border:'1px solid grey',borderBottomStyle:this.props.stacked?'solid':'none',backgroundColor:'white'};
				inactiveStyle = {padding:this.props.stacked ? '3px 6px' : '4px 6px 3px', [`border${this.props.stacked?'':'Bottom'}`]:'1px solid grey'};
			break;
			default:
				liStyle = {};
			break;
		}
		const tabs = [];
		this.props.links.forEach((e,i) => {
			const style = 
			tabs.push(<li key={`tab${i}`} style={{...liStyle,...(i === this.state.active ? {...activeStyle,...(this.props.activestyle || {})} : {...inactiveStyle,...(this.props.inactivestyle || {})}),...(disabled.indexOf(i) === -1 ? {} : {...disabledStyle,...(this.props.disabledstyle || {})}),...(this.props.linkstyle || {})}} onClick={()=>{if(disabled.indexOf(i) === -1) this.setState({active:i})}}>{e}</li>);
		});

		let openDiv = [];
		if (this.props.children) {
			const style = {
				margin: '0',
				zIndex: '10',
				padding:'6px',
			}
			Object.assign(style,(this.props.panelstyle || {}));
			this.props.children.forEach((e,i) => {
				if (i === this.state.active) openDiv.push(e);
			});
			openDiv = <div style={style}>{openDiv}</div>
		}
		return (
			<div id="nav">
				<div style={{ borderBottom: this.props.stacked ? 'none' : '1px solid grey', marginBottom:'6px'}}>
					<ul style={ulStyle}>
					{tabs}
					</ul>
				</div>
				{openDiv}
			</div>
		);
	}
}

class DragAndDrop extends Component {
	constructor(props) {
		super(props);
		this.offsetX = 0;
		this.offsetY = 0;
		this.caller = null;
		this.moving = false;
		this.state = {
			left: 0,
			top: 0,
		}
	}
	
	initiateMove = (e) => {
		if (!document.body.dataset.moving || this.moving) {
			if (!this.moving) {
				const rect = this.baseelement.getBoundingClientRect();
				this.offsetX = (e.pageX || e.touches[0].clientX) - rect.left;
				this.offsetY = (e.pageY || e.touches[0].clientY) - rect.top;
				this.dad.style.width = `${rect.width}px`;
				this.dad.style.top = `${rect.top + window.scrollY}px`;
				this.dad.style.left = `${rect.left + window.scrollX}px`;
				const clone = this.baseelement.cloneNode(true);
				this.dad.append(...this.baseelement.childNodes);
				this.baseelement.append(...clone.childNodes);
			}
			document.body.dataset.moving = true;
			document.body.addEventListener('mousemove',this.move);
			document.body.addEventListener('mouseup',this.endMove);
			document.body.addEventListener('touchmove',this.move,{passive:false});
			document.body.addEventListener('touchend',this.endMove);
			this.moving = true;
		}
	}
	
	move = (e) => {
		e.preventDefault();
		const scrollY = window.scrollY === undefined ? window.topOffset : window.scrollY;
		const scrollX = window.scrollX === undefined ? window.leftOffset : window.scrollX;
		const top = ((e.pageY || e.touches[0].clientY) + scrollY) - this.offsetY;
		const left = ((e.pageX || e.touches[0].clientX) + scrollX) - this.offsetX;
		if (e.touches) {
			var viewport = {
				top: scrollY,
				bottom: scrollY + window.innerHeight,
				left: scrollX,
				right: scrollX + window.innerWidth
			};
			if (((top + 10 >= viewport.bottom || top - 10 <= viewport.top) && this.props.vertical !== false) || ((left + 10 >= viewport.right || left - 10 <= viewport.left) && this.props.horizontal !== false)) {
				document.body.removeEventListener('touchmove', this.move);
				document.body.removeEventListener('touchend', this.endMove);
				if (top + 10 >= viewport.bottom) viewport.top += window.innerHeight / 4;
				if (top - 10 <= viewport.top) viewport.top -= window.innerHeight / 4;
				if (left + 10 >= viewport.right) viewport.left += window.innerWidth / 4;
				if (left - 10 <= viewport.left) viewport.left -= window.window.innerWidth / 4;
				window.scrollTo(viewport.left, viewport.top);
			}
		}
		if (this.props.vertical !== false) this.dad.style.top = `${top}px`;
		if (this.props.horizontal !== false) this.dad.style.left = `${left}px`;
	}
	
	endMove = (e) => {
		const rect = this.dad.getBoundingClientRect();
		while (this.baseelement.lastChild) {
			this.baseelement.removeChild(this.baseelement.lastChild);
		}
		this.baseelement.append(...this.dad.childNodes);
		document.body.removeEventListener('mousemove',this.move);
		document.body.removeEventListener('mouseup',this.endMove);
		document.body.removeEventListener('touchmove',this.move);
		document.body.removeEventListener('touchend',this.endMove);
		this.props.moveEnd(rect);
		delete document.body.dataset.moving;
		this.moving = false;
	}
	
	componentDidMount() {
		this.caller = (typeof this.props.caller === 'string' && this.baseelement.querySelector(this.props.caller)) || this.props.caller || this.baseelement;
		this.caller.addEventListener('mousedown',this.initiateMove);
		this.caller.addEventListener('touchstart',this.initiateMove);
	}
	componentDidUpdate(prevProps,prevState) {
		if (this.props.caller !== prevProps.caller) {
			this.caller.removeEventListener('mousedown',this.initiateMove);
			this.caller.removeEventListener('touchstart',this.initiateMove);
			this.caller = (typeof this.props.caller === 'string' && this.baseelement.querySelector(this.props.caller)) || this.props.caller || this.baseelement;
			this.caller.addEventListener('mousedown',this.initiateMove);
			this.caller.addEventListener('touchstart',this.initiateMove);
		}
	}
	
	render() {
		return (
			<span>
				<span ref={(e)=>this.baseelement = e} style={{zIndex:'10'}}>{this.props.children}</span>
				<div style={{position:'absolute',left:`0px`,top:`0px`,zIndex:'100'}} ref={(e)=>this.dad=e}></div>
			</span>
		);
	}
}
class Chevron extends Component {
	getProps = () => {
		const height = this.props.height || 20;
		const stroke = this.props.stroke || height/4;
		const dir = this.props.direction || 'left';
		return {
			dir: dir,
			stroke: stroke,
			height: height - (stroke/4),
			width: (height/2) + (stroke/4),
			color: this.props.color || 'black',
			points: [
				{x: dir === 'left' ? (height/2) - (stroke/4) : stroke/2, y: stroke/2},
				{x: dir === 'left' ? stroke - (stroke/4) : (height/2) - (stroke/2), y: height/2},
				{x: dir === 'left' ? (height/2) - (stroke/4) : stroke/2, y: height - (stroke/2)}
			]
		}
	}
	render() {
		const props = this.getProps();
		return (
			<svg height={props.height} width={props.width}>
				<polyline points={`${props.points[0].x},${props.points[0].y} ${props.points[1].x},${props.points[1].y} ${props.points[2].x},${props.points[2].y}`} style={{fill:'none',stroke:props.color,strokeWidth:props.stroke}} />
			</svg>
		);
	}
}

class DoubleChevron extends Chevron {
	render() {
		const props = this.getProps();
		return(
			<div style={{height:`${props.height}px`,overflow:'hidden'}}>
				<div style={{display:'inline-block'}}>
					<Chevron {...this.props} />
				</div>
				<div style={{display:'inline-block',marginLeft:`-${props.width - (props.stroke*1.5)}px`}}>
					<Chevron {...this.props} />
				</div>
			</div>
		);
	}
}

class ChevronEnd extends Chevron {
	render() {
		const props = this.getProps();
		return(	
		<div style={{display:'flex',flexDirection:props.dir === 'left' ? 'row' : 'row-reverse',justifyContent:'flex-start',height:`${props.height}px`,overflow:'hidden'}}>
			<div>
				<svg height={props.height} width={props.stroke*.75}>
					<line x1={props.stroke/2} y1={props.stroke/4} x2={props.stroke/2} y2={props.height} style={{stroke:props.color,strokeWidth:props.stroke}} />
				</svg>
			</div>
			<div>
				<Chevron {...this.props} />
			</div>
		</div>
		);

	}
}

class Paginator extends Component {
	constructor(props) {
		super(props);
		this.totalPages = Math.ceil(this.props.items.length/(this.props.perPage || 10));
		this.state = {
			currentPage: 1,
			changed: Date.now()
		}
	}
	
	onSelect = (e) => {
		let elem = e.target;
		while (elem.dataset.value === undefined) {
			elem = elem.parentNode;
		}
		if (elem.classList.contains('disabled')) return;
		this.setState({currentPage: elem.dataset.value < this.totalPages ?(elem.dataset.value < 1 ? 1 : elem.dataset.value) : this.totalPages},()=>{if (typeof this.props.onSelect === 'function') this.props.onSelect();});
	}
	
	componentDidMount() {
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps, prevState) {
		if (this.props !== prevProps) {
			this.totalPages = Math.ceil(this.props.items.length/(this.props.perPage || 10));
			this.setState({changed: Date.now()});
		}
	}
	
	componentWillUnmount() {
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		if (this.totalPages <= 1) return(<div style={{textAlign:'center'}}><div>page {this.state.currentPage} of {this.totalPages}</div></div>);
		const heights = {small:20,medium:25,large:30,'x-large':35};
		let height = (heights[this.props.size] || this.props.size) || 30;
		const max = this.props.max || 20;
		const foreground = this.props.foregroundColor || 'white';
		const background = this.props.backgroundColor || '#007bff';
		const currentSet = Math.ceil(this.state.currentPage/max) - 1;
		const currentPage = Number(this.state.currentPage);
		const pages = [];
		const style = {
			display:'flex', 
			alignItems:'center',
			justifyContent:'center',
			width:`${convertToPx(height)}px`,
			border:`1px solid ${foreground}`,
			color:foreground,
			background:background,
			fontSize: `${height-(height>25 ? 15 : 10)}px`,
			cursor:'pointer',
			fontWeight:'bold',
		}
		if (this.totalPages > max) {
			pages.push(<div key="first" className={currentPage === 1 ? 'disabled' : ''} style={{...style,...(currentPage === 1 ? {opacity:'.6',cursor:'default'} : {})}} data-value={1} onClick={this.onSelect}><ChevronEnd height={convertToPx(style.fontSize)} color={foreground} stroke={convertToPx(style.fontSize)/5} /></div>);
			pages.push(<div key="prev-set" className={currentSet === 0 ? 'disabled' : ''} style={{...style,...(currentSet === 0 ? {opacity:'.6',cursor:'default'} : {})}} data-value={currentPage - max} onClick={this.onSelect}><DoubleChevron height={convertToPx(style.fontSize)} color={foreground} stroke={convertToPx(style.fontSize)/5} /></div>);
		}
		pages.push(<div key="prev" style={{...style,...(currentPage === 1 ? {opacity:'.6',cursor:'default'} : {})}} data-value={currentPage - 1} onClick={this.onSelect}><Chevron height={convertToPx(style.fontSize)} color={foreground} stroke={convertToPx(style.fontSize)/5} /></div>);
		for (let x= 1 + (currentSet*max);x<=(currentSet+1)*max;x++) {
			pages.push(<div key={`page${x}`} className={x===currentPage ? 'disabled' : ''} data-value={x} style={{...style,...(x === currentPage ? {background:foreground,color:background,borderColor:background,cursor:'default'} : {})}} onClick={this.onSelect}>{x}</div>);
			if (x === this.totalPages) break;
		}
		pages.push(<div key="next" className={currentPage === this.totalPages ? 'disabled' : ''} style={{...style,...(currentPage === this.totalPages ? {opacity:'.6',cursor:'default'} : {})}} data-value={currentPage + 1} onClick={this.onSelect}><Chevron direction="right" height={convertToPx(style.fontSize)} color={foreground} stroke={convertToPx(style.fontSize)/5} /></div>);
		if (this.totalPages > max) {
			pages.push(<div key="next-set" className={currentSet+1 === Math.ceil(this.totalPages/max) ? 'disabled' : ''} style={{...style,...(currentSet+1 === Math.ceil(this.totalPages/max) ? {opacity:'.6',cursor:'default'} : {})}} data-value={currentPage + max} onClick={this.onSelect}><DoubleChevron direction="right" height={convertToPx(style.fontSize)} color={foreground} stroke={convertToPx(style.fontSize)/5} /></div>);
			pages.push(<div key="last" className={currentPage === this.totalPages ? 'disabled' : ''} style={{...style,...(currentPage === this.totalPages ? {opacity:'.6',cursor:'default'} : {})}} data-value={this.totalPages} onClick={this.onSelect}><ChevronEnd direction="right" height={convertToPx(style.fontSize)} color={foreground} stroke={convertToPx(style.fontSize)/5} /></div>);
		}
		return(
			<div style={{textAlign:'center'}}>
				<div style={{display:'inline-block',border:`1px solid ${background}`}}>
					<div style={{display:'flex',border:`1px solid ${foreground}`,height:`${height}px`}}>
					{pages}
					</div>
				</div>
				<div>page {this.state.currentPage} of {this.totalPages}</div>
			</div>
		);
	}
}

class DatePicker extends Component {
	constructor(props) {
		super(props);
		const selected = this.props.selected || moment().format('MM/DD/YYYY');
		this.state = {
			month: this.props.month === undefined ? moment().month() : (isNaN(this.props.month) ? moment(Date.parse(`${this.state.month} 1 ${this.state.year}`)).month() : this.props.month - 1),
			year: this.props.year || moment().year(),
			selected: moment(new Date(selected)),
			changed: Date.now()
		}
	}

	onSelect = (e) => {
		const selected = e.target.dataset.value;
		this.setState({selected: moment(selected)}, () => {
			if (typeof this.props.onSelect === 'function') this.props.onSelect(selected);
		});
	}
		
	componentDidMount() {
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps,prevState) {
		if (prevProps !== this.props) {
			const state = {};
			for (const k in this.props) {
				if (prevProps[k] !== this.props[k]) {
					let v = this.props[k];
					switch (k) {
						case 'month':
							v = isNaN(this.props.month) ? moment(Date.parse(`${this.props.month} 1 ${moment().year()}`)).month() : this.props.month - 1;
						break;
						case 'selected':
							v = moment(new Date(this.props.selected)).tz('America/New_York');
						break;
						default:
						break;
					}
					state[k] = v;
				}
			}
			if (Object.keys(state).length > 0) state.changed = Date.now();
			this.setState({state});
		}
	}

	componentWillUnmount() {
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		const weekStart = this.props.startMonday ? 1 :0;
		const weekEnd = this.props.startMonday ? 7 : 6;
		const dayformat = this.props.dayformat || 'ddd';
		const monthFormat = this.props.monthFormat || 'MMMM YYYY';
		const hilightStyle = {
			color: this.props.monthColor || '#fff',
			background: this.props.hilightColor || '#007bff'
		}
		const headerStyle = {...hilightStyle,...{fontWeight: 'bold',fontSize:'14pt'},...(this.props.headerStyle || {})};
		const dateStyle = {...{cursor:'pointer'},...(this.props.daystyle || {})};
		const createCell = (date,className=[]) => {
			if (date.isSame(moment(),'day')) {
				className.push('current');
			}
			if (date.isSame(moment(this.state.selected),'day')) {
				className.push('selected');
			}
			if ((this.props.min !== undefined && date.isBefore(moment(new Date(this.props.min)).startOf('day'))) || (this.props.max !== undefined && date.isAfter(moment(new Date(this.props.max)).startOf('day')))) {
				className.push('disabled');
			}
			return(<div key={moment(date).format('YYYY-M-D')} className={className.join(' ')} style={{...dateStyle,...(className.includes('current') ? hilightStyle : {})}} data-value={date.toISOString()} onClick={this.onSelect}>{date.date()}</div>);
		}
		const getDOW = (date, iso = false) => {
			if (iso) {
				return moment(date).isoWeekday();
			} else {
				return moment(date).day();
			}
		}
		const prev = [];
		const next = [];
		if (this.props.min === undefined || moment([this.state.year,this.state.month]).isAfter(moment(new Date(this.props.min)))) {
			const state = {
				month: moment([this.state.year,this.state.month]).subtract(1,'month').month(),
				year: moment([this.state.year,this.state.month]).subtract(1,'month').year()
			}
			prev.push(<span key="prev" aria-hidden="true" style={{cursor:'pointer'}} onClick={()=>{this.setState(state)}}><Chevron direction="left" color={hilightStyle.color} height={this.props.chevronHeight || 20} /></span>);
		}
		if (this.props.max === undefined || moment([this.state.year,this.state.month]).isBefore(moment(new Date(this.props.max)))) {
			const state = {
				month: moment([this.state.year,this.state.month]).add(1,'month').month(),
				year: moment([this.state.year,this.state.month]).add(1,'month').year()
			}
			next.push(<span key="next" aria-hidden="true" style={{cursor:'pointer'}} onClick={()=>{this.setState(state)}}><Chevron direction="right" color={hilightStyle.color} height={this.props.chevronHeight || 20} /></span>);
		}
		const weeks = [];
		let week = [];
		for (let d=weekStart;d<=weekEnd;d++) {
			const day = weekStart === 0 ? moment().day(d) : moment().isoWeekday(d);
			week.push(<div key={day.format('dddd')} className="col">{dayformat === 'd' ? day.format('dd').charAt(0) : day.format(dayformat)}</div>);
		}
		weeks.push(
				<div key="day-of-week" className="row day-of-week">
					{[...week]}
				</div>
		);
		week = [];
		for (let d=getDOW([this.state.year,this.state.month],weekStart===1);d > weekStart; d--) {
			const date = moment([this.state.year,this.state.month]).subtract(d,'days').startOf('day');
			const className = ['col','past'];
			week.push(createCell(date,['col','past']));
		}
		for (let d=1;d <= moment([this.state.year,this.state.month]).endOf('month').date(); d++) {
			const date = moment([this.state.year,this.state.month,d]).startOf('day');
			week.push(createCell(date,['col']));
			if (getDOW([this.state.year,this.state.month,d],weekStart===1) === weekEnd) {
				weeks.push(
					<div key={`weeks${date.week()}`} className="row day">
						{[...week]}
					</div>
				);
				week = [];
			}
		}
		
		if (moment([this.state.year,this.state.month]).endOf('month').day() < weekEnd) {
			for (let d=1;d <= weekEnd-getDOW(moment([this.state.year,this.state.month]).endOf('month'),weekStart===1); d++) {
				const date = moment([this.state.year,this.state.month]).endOf('month').add(d,'days').startOf('day');
				week.push(createCell(date,['col','past']));
			}
			weeks.push(
				<div key={`weeks${moment([this.state.year, this.state.month]).endOf('month').week()}`} className="row day">
					{[...week]}
				</div>
			);
		}

		return(
					<div {...setProps({...this.props},{className:"date-picker"})}>
						<div className="row month" style={headerStyle}>
							<div className="col prev">{prev}</div>
							<div className="col">{moment([this.state.year,this.state.month]).format(monthFormat)}</div>
							<div className="col next">{next}</div>
						</div>
						<div className="days" style={typeof this.props.hilightColor !== 'undefined' ? {borderColor: this.props.hilightColor} : {}}>
							{weeks}
						</div>
					</div>
		);
	}
}

class Collapse extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0
		}
	}
	
	openCollapse = () => {
		let height = 0;
		if (this.props.open) {
			height = this.collapse.clientHeight;
			if (typeof this.props.onOpen === 'function') this.props.onOpen();
		} else {
			if (typeof this.props.onClose === 'function') this.props.onClose();
		}
		this.setState({height:height},()=>{
			if (this.props.open) {
				this.interval = setInterval(this.setHeight,100);
				if (typeof this.props.hasOpened === 'function') this.props.hasOpened();
			} else {
				clearInterval(this.interval);
				if (typeof this.props.hasClosed === 'function') this.props.hasClosed();
			}
		});
	}
	
	setHeight = () => {
		if(this.props.open && this.collapse.clientHeight !== this.state.height) {
			this.setState({height:this.collapse.clientHeight});
		}
	}
	componentDidMount() {
		if (this.props.open) {
			this.setState({height:this.collapse.clientHeight},()=>{
				this.interval = setInterval(this.setHeight,100);
				if (typeof this.props.onMount === 'function') this.props.onMount();
			});
		}
	}
	
	componentDidUpdate(prevProps,prevState) {
		if (prevProps.open !== this.props.open) this.openCollapse();
	}
	componentWillUnmount() {
		clearInterval(this.interval);
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		const defaultProps = {
			 className:"collapse",
			 style:{
				 height: `${this.state.height}px`, 
				 overflow:' hidden', 
				 transition: 
				 'height 0.25s ease 0s'
			}
		}
		const props = setProps({...this.props},defaultProps);
		return(
			<div {...props}>
				<div className='collapse-content' ref={(divElement) => { this.collapse = divElement }}>
					{this.props.children}
				</div>
			</div>	
		);
	}
}

class Popover extends Component {
	constructor(props) {
		super(props);
		this.interval = null;
		this.contentHTML = '';
		this.caller - null;
		const defaultRect = {
			x:0,
			y:0,
			top:0,
			left:0,
			bottom:0,
			right:0,
			width:0,
			height:0
		}
		this.state = {
			open: false,
			offset: 0,
			callerRect: {...defaultRect},
			borderRect: {...defaultRect},
			width:0,
			height:0,
		}
	}
	
	setSize = (props = {},prevProps ={}) => {
		if (this.contentHTML !== this.content.innerHTML) {
			this.contentHTML = this.content.innerHTML;
			this.setState({open:false},() => {
				const bodyRect = document.body.getBoundingClientRect();
				const content = this.content.cloneNode(true);
				content.style.visibility = 'hidden';
				document.body.prepend(content);
				const borderRect = content.getBoundingClientRect();
				document.body.removeChild(content);
				this.setState({height: borderRect.height > bodyRect.height ? bodyRect.height : borderRect.height, width: borderRect.width > bodyRect.width ? bodyRect.width : borderRect.width, borderRect: borderRect, open: this.props.open});
			});
		}
	}
	
	checkPosition = () => {
		if(this.caller !== null) {
			const rect = this.setRect(this.caller.getBoundingClientRect());
			for (const i in rect) {
				if (rect[i] !== this.state.callerRect[i]) {
					this.setState({callerRect:rect});
					break;
				}
			}
		}
	}
	
	statsInterval = () => {
		this.setSize();
		this.checkPosition();
	}
	
	setRect = (r) => {
		const rect = {};
		for (const k in r) {
			let val = r[k];
			switch (k) {
				case 'top':
				case 'bottom':
				case 'y':
					rect[k] = val + window.scrollY;
				break;
				case 'left':
				case 'right':
				case 'x':
					rect[k] = val + window.scrollX;
				break;
				default:
					rect[k] = val;
				break;
			}
		}
		return rect;
	}

	componentDidMount() {
		this.caller = typeof this.props.caller === 'string' ? document.querySelector(this.props.caller) : this.props.caller;
		this.interval = setInterval(this.statsInterval,100);
		if (this.caller !== null) {
			this.setState({callerRect:this.setRect(this.caller.getBoundingClientRect())},() => {
				this.setSize();
				if (typeof this.props.onMount === 'function') this.props.onMount();
			});
		}
	}
	componentDidUpdate(prevProps, prevState) {
		const props = {...this.props};
		const prev = {...prevProps};
		delete props.open;
		delete prev.open;
		if (JSON.stringify(Object.keys(props).sort()) === JSON.stringify(Object.keys(prev).sort())) {
			for (const k in props) {
				if (props[k] !== prev[k]) {
					delete props[k];
					break;
				} else {
					delete props[k];
					delete prev[k];
				}
			}
		}
		if (Object.keys(props).length === Object.keys(prev).length) {
			this.setSize(this.props,prevProps);
		}
		if (this.props.open !== prevProps.open || this.props.caller !== prevProps.caller) {
			if (prevProps.caller !== this.props.caller) this.caller = typeof this.props.caller === 'string' ? document.querySelector(this.props.caller) : this.props.caller;
			this.checkPosition();
			if (this.props.open && typeof this.props.onOpen === 'function') {
				this.props.onOpen();
			} else if (!this.props.open && typeof this.props.onClose === 'function') {
				this.props.onClose();
			}
			if (this.props.open !== prevProps.open) this.setState({open:this.props.open},() => {
				if (this.props.open && typeof this.props.hasOpened === 'function') {
					this.props.hasOpened();
				} else if (!this.props.open && typeof this.props.hasClosed === 'function') {
					this.props.hasClosed();
				}
			});
		}
	}
	
	componentWillUnmount() {
		clearInterval(this.interval);
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		const bodyRect = document.body.getBoundingClientRect();
		const props = {...this.props};
		const passedStyle = props.style || {};
		const backgroundColor = passedStyle.background || (passedStyle.backgroundColor || (this.props.backgroundColor || 'rgb(255,255,255)'));
		const borderColor = this.props.borderColor || 'rgb(204,204,204)';
		const borderWidth = typeof this.props.borderWidth !== 'undefined' ? convertToPx(this.props.borderWidth) :1;
		const arrowSize = typeof this.props.arrowSize !== 'undefined' ? convertToPx(this.props.arrowSize) : 10;
		delete props.style;
		const changePosition = (position) => {
			const pos = this.props.position || 'bottom';
			const vert = ['left','right'];
			const horz = ['top','bottom'];
			const obj = vert.indexOf(position) === -1 ? horz : vert;
			const offset = this.state.borderRect[obj === vert ? 'width' : 'height'] + arrowSize + 5;
			let offsite;
			if (obj.indexOf(position) === 0) {
				offsite = this.state.callerRect[position] - offset < Math.abs(bodyRect[obj[0]]);
			} else {
				offsite = this.state.callerRect[position] + offset > Math.abs(bodyRect[obj[0]]) + bodyRect[(obj === vert ? 'width' : 'height')];
			}
			if (offsite) {
				if (position === pos) {
					return changePosition(obj[1-obj.indexOf(position)]);
				} else if (obj.indexOf(pos) > -1 && obj.indexOf(position) !== obj.indexOf(pos)) {
					return changePosition((obj === vert ? horz[1] : vert[1]));
				} else if (obj.indexOf(pos) === -1 && obj.indexOf(position) === 1) {
					return changePosition(obj[0]);
				} else {
					return pos;
				}
			}
			return position;
		}
		const position = changePosition(this.props.position || 'bottom');
		
		const defaultProps = {
			className:'popover'
		}
		
		const style = {
			popover : {
				position: 'absolute', 
				display: this.state.open ? 'block' : 'none',
				width: `${this.state.borderRect.width + (position === 'right' || position === 'left' ? arrowSize : 0)}px`,
				zIndex: '1000000',
			},
			flex: {
				position: 'relative',
				display: 'flex',
				padding: '0',
				margin: '0',
				alignItems: 'flexStart',
			},
			arrowDiv: {
				position:'relative',
				zIndex:'20',
			},
			borderArrow: {
				width:'0',
				height:'0',
				zIndex:'30',
				borderTop: `${arrowSize}px solid transparent`,
				borderBottom: `${arrowSize}px solid transparent`,
				borderLeft: `${arrowSize}px solid transparent`,
				borderRight: `${arrowSize}px solid transparent`,
			},
			content: {
				position:'relative',
				border:`${borderWidth}px solid ${borderColor}`,
				zIndex:'10',
				display:'inline-block',
				background: backgroundColor,
				padding:'6px'
			},
		}
		style.arrow = {...style.borderArrow};
		style.arrow.position = 'absolute';
		if (position === 'top' || position === 'bottom') {
			const left =	Math.ceil((this.state.callerRect.left + (this.state.callerRect.width/2)) - (this.state.borderRect.width/2));
			let marginOffset = 0;
			if (left < Math.abs(bodyRect.left) + 2) marginOffset = left + bodyRect.left;
			if (left + this.state.borderRect.width > bodyRect.width - bodyRect.left - 2) marginOffset = (left + this.state.borderRect.width) - (bodyRect.width - bodyRect.left);
			style.popover.left = `${left < Math.abs(bodyRect.left) + 2 ? Math.abs(bodyRect.left) + 2 : (left + this.state.borderRect.width > bodyRect.width - bodyRect.left - 2 ? ((bodyRect.width - bodyRect.left) - this.state.borderRect.width) - 2 : left)}px`;
			style.popover.top = position === 'top' ? `${this.state.callerRect.top - this.state.borderRect.height - arrowSize - 3}px` : `${this.state.callerRect.bottom + 3}px`;
			style.flex.flexDirection = position === 'top' ? 'column-reverse' : 'column';
			style.borderArrow.borderBottom = position === 'bottom' ? `${arrowSize}px solid ${borderColor}` : 'none';
			style.borderArrow.borderTop = position === 'top' ? `${arrowSize}px solid ${borderColor}` : 'none';
			style.borderArrow.marginLeft = `${((this.state.borderRect.width/2) - arrowSize) + marginOffset}px`;
			style.arrow.borderBottom = position === 'bottom' ? `${arrowSize}px solid ${backgroundColor}` : 'none';
			style.arrow.borderTop = position === 'top' ? `${arrowSize}px solid ${backgroundColor}` : 'none';
			style.arrow.left = `${((this.state.borderRect.width/2) - arrowSize) + marginOffset}px`;
			style.arrow[position === 'top' ? 'bottom' : 'top'] = `${borderWidth}px`;
		} else {
			const top =	Math.ceil((this.state.callerRect.top + (this.state.callerRect.height/2)) - (this.state.borderRect.height/2));
			let marginOffset = 0;
			if (top < Math.abs(bodyRect.top) + 2) marginOffset = top + bodyRect.top;
			if (top + this.state.borderRect.top > bodyRect.height - bodyRect.top - 2) marginOffset = (top + this.state.borderRect.height) - (bodyRect.height - bodyRect.top);
			style.popover.top = `${top < Math.abs(bodyRect.top) + 2 ? Math.abs(bodyRect.top) + 2 : (top + this.state.borderRect.height > bodyRect.height - bodyRect.top - 2 ? ((bodyRect.height - bodyRect.top) - this.state.borderRect.height) - 2 : top)}px`;
			style.popover.left = position === 'left' ? `${this.state.callerRect.left - this.state.borderRect.width - arrowSize - 3}px` : `${this.state.callerRect.right + 3}px`;
			style.flex.flexDirection = position === 'left' ? 'row-reverse' : 'row';
			style.borderArrow.borderRight = position === 'right' ? `${arrowSize}px solid ${borderColor}` : 'none';
			style.borderArrow.borderLeft = position === 'left' ? `${arrowSize}px solid ${borderColor}` : 'none';
			style.borderArrow.marginTop = `${((this.state.borderRect.height/2) - arrowSize) + marginOffset}px`;
			style.arrow.borderRight= position === 'right' ? `${arrowSize}px solid ${backgroundColor}` : 'none';
			style.arrow.borderLeft = position === 'left' ? `${arrowSize}px solid ${backgroundColor}` : 'none';
			style.arrow.top = `${((this.state.borderRect.height/2) - arrowSize) + marginOffset}px`;
			style.arrow[position === 'left' ? 'right' : 'left'] = `${borderWidth}px`;
		}	
		return(
			<div style={style.popover}>
				<div style={style.flex} ref={(e)=>{this.popover = e}}>
					<div style={style.arrowDiv}>
						<div style={style.borderArrow}></div>
					</div>
					<div style={style.arrow} ref={(e) =>{this.arrow = e}}></div>
					<div style={{...style.content,...passedStyle}} ref={(e)=>{this.content=e}}>
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}

class PopoverHeader extends Popover {
	componentDidMount() {
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps, prevState) {
	}
	
	render() {
		const defaultProps = {
			className: 'popover-header'
		}
		return(
			<div {...setProps({...this.props},defaultProps)}>{this.props.children}</div>
		);
	}
}

class PopoverBody extends Popover {
	componentDidMount() {
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}

	componentDidUpdate(prevProps, prevState) {
	}

	render() {
		const defaultProps = {
			className: 'popover-body'
		}
		return(
			<div {...setProps({...this.props},defaultProps)}>{this.props.children}</div>
		);
	}
}

class CloseButton extends Component {
	componentDidMount() {
		this.x.style.left = `${Math.abs(this.x.getBoundingClientRect().x - this.x.querySelectorAll('span')[0].getBoundingClientRect().x)}px`;
	}
	
	render() {
		const color = this.props.color || 'black';
		const height = convertToPx((this.props.height || '14px'));
		const width = convertToPx((this.props.width || '3px'));
		return(
			<div className="close-button" style={{position:'relative',cursor: 'pointer'}} onClick={()=>{if(typeof this.props.onClick === 'function') this.props.onClick()}}>
				<span style={{position: 'absolute', display: 'inline-block'}} ref={(e)=>this.x=e}>
					<span style={{position: 'absolute', left: '50%', width: `${width}px`, height: `${height}px`, transform: 'rotate(45deg)', background: color, zIndex: '1'}}></span>
					<span style={{position: 'absolute', left: '50%', width: `${width}px`, height: `${height}px`, transform: 'rotate(-45deg)', background: color, zIndex: '1'}}></span>
					<span style={{position: 'absolute', left: '0px', top: '0px', width: '100%', height: '100%', zIndex: '10'}}></span>
				</span>
			</div>
		);
	}
}

class Overlay extends Component {
	constructor(props) {
		super(props);
		this.state = {open: this.props.open}
	}
	
	closeOverlay = (e) => {
		if ((typeof this.props['click-to-close'] === 'undefined' || this.props['click-to-close']) && (e.target === this.overlay || e.target === this.content)) {
			if(typeof this.props.onClose === 'function') this.props.onClose();
			this.setState({open: false});
		}
	}
	
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.open !== this.props.open) {
			this.setState({open: this.props.open});
		}
	}
	
	render() {
		if (this.state.open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
		const speed = this.props.speed || '.5';
		const style = {
			position: 'fixed', 
			top: '0px', 
			left: '0px', 
			zIndex: this.props.zIndex || '99000', 
			width: '100%', 
			height: this.state.open || this.props.transition === 'drop' ? '100%' : '0px',
			opacity: this.state.open ? '1' : '0',
			background: getRGBA((this.props.color || 'rgb(0,0,0)'),(this.props.opacity || '0.3')),
			overflow: 'hidden',
			margin: '0',
			padding: '0',
			boxSizing: 'border-box'
		}
		
		switch (this.props.transition) {
			case 'drop':
//				console.log(typeof this.overlay);
				style.marginTop = this.state.open ? '0px' : `-${typeof this.overlay !== 'undefined' ? this.overlay.offsetHeight : '0'}px`;
				style.transition = `margin-top ${speed}s ease 0s${this.state.open ? '' : ', opacity 0s ease ' + speed + 's'}`;
			break;
			case 'fade':
				style.transition=`opacity ${speed}s ease 0s${this.state.open ? '' : ', height 0s ease ' + speed + 's'}`;
			break;
			default:
				style.transition = this.props.transition
			break;
		}
		const props = setProps({className:'overlay',style:style},{...this.props});
		delete props.open;
		delete props.transition;
		delete props['click-to-close'];
		
		return (
			<div {...props} ref={(e)=>{this.overlay = e}} onClick={this.closeOverlay}>
				{this.props.children}
			</div>
		);
	}
}

class Spinner extends Component {
	constructor(props) {
		super(props);
		this.state = {open:this.props.open === undefined ? true : this.props.open}
	}
	
	getProperties = () => {
		const properties = {
			size: this.props.size || 32,
			stroke: this.props.strokeWidth || 3
		}
		properties.radius = (properties.size - properties.stroke) / 2;
		properties.circumference = (properties.radius * 2) * Math.PI;
		return properties;
	}
	
	setStyle = () => {
		const properties = this.getProperties();
		const createdStyleTag = document.createElement("style");
		createdStyleTag.textContent = `
			@-webkit-keyframes line {
				0% {
					stroke-dasharray: ${properties.circumference * .95}, ${properties.circumference * .05};
					-webkit-transform: rotate(0);
							transform: rotate(0); 
				}
				50% {
					stroke-dasharray: ${properties.circumference * .05},${properties.circumference * .95};
					stroke-dashoffset: 0; 
				}
				100% {
					stroke-dasharray:${properties.circumference * .95},${properties.circumference * .05};
					stroke-dashoffset: ${properties.circumference * .05};
					-webkit-transform: rotate(180deg);
							transform: rotate(180deg); 
				} 
			}

			@keyframes line {
				0% {
					stroke-dasharray: 0, ${properties.circumference};
					-webkit-transform: rotate(0);
					transform: rotate(0); 
				}
				50% {
					stroke-dasharray: ${properties.circumference * .75},${properties.circumference * .25};
					stroke-dashoffset: 0; 
				}
				100% {
					stroke-dasharray: 0,${properties.circumference};
					stroke-dashoffset: -${properties.circumference * .75};
					-webkit-transform: rotate(90deg);
					transform: rotate(90deg); 
				}
			}
		`;

		this.spinner.appendChild(createdStyleTag);
	}
	
	componentDidMount() {
		document.body.style.overflow = 'hidden';
		this.setStyle();
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps, prevState) {
		if (this.props.open !== prevProps.open) {
			if (this.props.open && typeof this.props.onOpen === 'function') {
				this.props.onOpen();
			} else if (!this.props.open && typeof this.props.onClose === 'function') {
				this.props.onClose();
			}
			this.setState({open:this.props.open}, () => {
				if (this.props.open && typeof this.props.hasOpened === 'function') {
					this.props.hasOpened();
				} else if (!this.props.open && typeof this.props.hasClosed === 'function') {
					this.props.hasClosed();
				}
			});
		}
		if (this.props.size !== prevProps.size || this.props.strokeWidth) {
			this.spinner.removeChild(this.spinner.querySelector('style'));
			this.setStyle();
		}

	}
	
	componentWillUnmount() {
		document.body.style.overflow = 'auto';
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	render() {
		const properties = this.getProperties();
		return (
			<Overlay className="loader" open={this.state.open} ref={(e)=>this.loader=e} color={this.props.overlayBackground || '#fff'} opacity={this.props.overlayOpacity || '0.6'} click-to-close={false}>
				<div className="spinner" ref={(e)=>this.spinner=e}>
					<svg viewBox={`0 0 ${properties.size} ${properties.size}`} width={properties.size} height={properties.size}>
						<circle id="spinner-bg" cx={properties.size/2} cy={properties.size/2} r={properties.radius} stroke="black" strokeWidth={`${properties.stroke}px`} strokeOpacity="0.1" fill="none"></circle>
						<circle id="spinner" cx={properties.size/2} cy={properties.size/2} r={properties.radius} fill="none" stroke={this.props.stroke || 'blue'} strokeWidth={`${properties.stroke}px`} style={{animation:"line 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite, rotate 1.6s linear infinite"}}></circle>
					</svg>
				</div>
			</Overlay>
		);
	}
}

class Modal extends Component {
	constructor(props) {
		super(props);
		this.interval = null;
		this.HTML = '';
		this.state = {
			open:false,
			marginTop: '0px',
			changed: Date.now()
		}
	}
	
	onClose = () => {
		if (typeof this.props.onClose === 'function') this.props.onClose();
		this.setState({open:false},() => {if (typeof this.props.hasClosed === 'function') this.props.hasClosed();});
	}
	
	setMarginTop = () => {
		if (typeof this.flexBox !== 'undefined' && this.flexBox.innerHTML !== this.HTML) {
			const rect = this.modal.getBoundingClientRect();
			this.setState({marginTop: `-${rect.height + rect.top}px`});
			this.HTML = this.flexBox.innerHTML;
		}
	}
	
	componentDidMount() {
		const state = {open:this.props.open};
		if (this.props.open && typeof this.props.onOpen === 'function') this.props.onOpen();
		if (this.props.transition === 'drop') {
			clearInterval(this.interval);
			this.interval = setInterval(this.setMarginTop,100);
//			setTimeout(this.setMarginTop,200);
		}
		this.setState(state,()=> {if (this.props.open && typeof this.props.hasOpened === 'function') this.props.hasOpened();});
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps,prevState) {
		if (this.props.open !== prevProps.open) {
			if (this.props.open && typeof this.props.onOpen === 'function') this.props.onOpen();
			if (!this.props.open && typeof this.props.onClose === 'function') this.props.onClose();
			this.setState({open:this.props.open},()=> {
				if (this.props.open && typeof this.props.hasOpened === 'function') this.props.hasOpened();
				if (!this.props.open && typeof this.props.hasClosed === 'function') this.props.hasClosed();
			});
		}
		if (this.props !== prevProps) {
			if (this.props.transition !== prevProps.transition) {
				this.setState({changed:Date.now()})
				if (this.props.transition === 'drop') {
					this.interval = setInterval(this.setMarginTop,100);
				} else {
					clearInterval(this.interval);
					this.setState({marginTop: '0px'});
				}
			}
		}
	}
	
	componentWillUnmount() {
		clearInterval(this.interval);
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		const passedStyle = {...this.props.style} || {};
		const defaultStyle = {
			display: this.props.fullScreen ? 'block' : 'inline-block',
			background: 'white',
			width: 'auto',
			margin: `20px ${this.props.fullScreen ? '0' : '10px'} 10px`,
			padding: '10px 20px',
			borderRadius: '10px',
			textAlign: 'left'
		}

		const flexStyle = {
			display:'table',
			width: this.props.fullScreen ? '96%' : 'auto',
			height:this.state.open ? 'auto' : '0px',
			marginTop: this.state.open ? '0px' : this.state.marginTop,
			marginLeft: 'auto',
			marginRight: 'auto',
		}
		switch (this.props.transition) {
			case 'fade':
				passedStyle.opacity = this.state.open ? (passedStyle.opacity || '1') : '0';
				passedStyle.transition = `opacity ${this.props.transitionSpeed || '3s'} ease 0s`;
			break;
			case 'drop':
				flexStyle.transition = this.state.open ? `margin-top ${this.props.transitionSpeed || '.5s'} ease 0s` : '';
			break;
			default:
				if(typeof this.props.transition === 'string') passedStyle.transition = this.props.transition;
			break;
		}
		return(
			<Overlay style={{overflow:'auto',textAlign:'center'}} click-to-close={typeof this.props['click-to-close'] === 'undefined' ? true : this.props['click-to-close']} onClose={this.onClose} color={this.props.overlayColor || 'rgb(0,0,0)'} opacity={this.state.open ? (this.props.overlayOpacity || '0.3') : '0'} open={this.state.open}>
				<div style={flexStyle} ref={(e)=>this.flexBox = e}>
					<div className="modal" style={{...defaultStyle, ...passedStyle}} ref={(e)=>this.modal=e}>
						{this.props.children}
					</div>
				</div>
			</Overlay>
		);
	}
}

class ModalHeader extends Modal {
	componentDidMount() {
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps,prevState) {
	}
	
	componentWillUnmount() {
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		const style={padding:'6px',flexGrow:1,textAlign:this.props.align || 'center'};
		const closeButton = [];
		if (this.props.closeButton || (this.props.footer !== true && typeof this.props.closeButton === 'undefined')) {
			closeButton.push(<div key="modal-header" style={{padding:'6px'}} onClick={this.onClose}><CloseButton color={this.props['close-button-color'] || 'black'} /></div>);
		}
		
		return(
			<div style={{[`border${this.props.footer ? 'Top' : 'Bottom'}`]: '1px solid rgb(204, 204, 204)', display:'flex',flexDirection:this.props.closePosition === 'left' ? 'row-reverse' : 'row'}} ref={(e)=>this.header=e}>
				<div style={{...style,...(this.props.style || {})}}>{this.props.children}</div>
				{closeButton}
			</div>
		);
	}
}

class ModalBody extends Modal {
	componentDidMount() {
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps,prevState) {
	}
	
	componentWillUnmount() {
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		return(
			<div style={{...{padding:'6px 0'},...(this.props.style || {})}} ref={(e)=>this.body=e}>
				{this.props.children}
			</div>
		);
	}
}

class ModalFooter extends Modal {
	componentDidMount() {
		if (typeof this.props.onMount === 'function') this.props.onMount();
	}
	
	componentDidUpdate(prevProps,prevState) {
	}
	
	componentWillUnmount() {
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		return(
			<ModalHeader footer={true} {...this.props} />
		);
	}
}

class OffCanvasMenu extends Component {
	constructor(props) {
		super(props);
		this.margin = null;
		this.state = {
			open: this.props.open || false
		}
	}
	
	showMenu = () => {
		this.setState({open: !this.state.open});
	}
	
	closeMenu = () => {
		if (typeof this.props.onClose === 'function') this.props.onClose();
		this.setState({open: false},()=>{if (typeof this.props.hasClosed === 'function') this.props.hasClosed();});
	}
	
	componentDidMount() {
		if (this.props.push) {
			const position = this.props.position || 'left';
			const width = convertToPx((typeof this.props.style !== 'undefined' && typeof this.props.style.width !== 'undefined' ? this.props.style.width : '315px'));
			this.margin = window.getComputedStyle(document.body, null).getPropertyValue(`margin-${this.props.position || 'left'}`);
			document.body.style[`margin${position.charAt(0).toUpperCase() + position.substring(1).toLowerCase()}`] = this.props.open ? `${width + convertToPx(this.margin)}px` : this.margin;
			document.body.style.position = 'relative';
			document.body.style.transition = `margin-${this.props.position || 'left'} ${this.props.speed || '.5'}s ease 0s`;
		}
		if (typeof this.props.onMount === 'function') this.props.onMount();
		if (this.props.open && typeof this.props.hasOpened === 'function') this.props.hasOpened();
	}
	
	componentDidUpdate(prevProps,prevState) {
		if (this.props.open !== prevProps.open) {
			if (this.props.open && typeof this.props.onOpen === 'function') this.props.onOpen();
			if (!this.props.open && this.state.open && typeof this.props.onClose === 'function') this.props.onClose();
			this.setState({open:this.props.open},() => {
				if (this.props.push) {
					const position = this.props.position || 'left';
					const width = convertToPx((typeof this.props.style !== 'undefined' && typeof this.props.style.width !== 'undefined' ? this.props.style.width : '315px'));
					if (this.props.push) document.body.style[`margin${position.charAt(0).toUpperCase() + position.substring(1).toLowerCase()}`] = this.props.open ? `${width + convertToPx(this.margin)}px` : this.margin;
					this.state.open ? (typeof this.props.style !== 'undefined' && typeof this.props.style.width !== 'undefined' ? this.props.style.width : '315px') : '0px'
				}
				if (this.props.open && typeof this.props.hasOpened === 'function') this.props.hasOpened();
				if (!this.props.open && prevState.open && typeof this.props.hasClosed === 'function') this.props.hasClosed();
			});
		}
	}
	
	componentWillUnmount() {
		if (typeof this.props.onUnmount === 'function') this.props.onUnmount();
	}
	
	render() {
		const position = this.props.position || 'left';
		const opacity = this.props.overlayOpacity || '0.3';
		const type = this.props.type || 'slide';
		const speed = this.props.speed || '.5';
		const props = {...this.props};
		const passedStyle = props.style || {};
		delete props.style;
		delete props.overlay;
		delete props.push;
		delete props['click-to-close'];
		const style = {...{ position:'relative', width: '315px', height: '100%', background: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)',...passedStyle}}
		const width = style.width;

		switch (type) {
			case 'slide':
				let pos = this.state.open ? '0px' : '-100%';
				if (position === 'right') {
					const w = width.match(/\d+/)[0];
					pos = this.state.open ? `${window.innerWidth - w}px` : `${window.innerWidth}px`;
				}
				style.transform = `translate3d(${pos}, 0px, 0px)`;
				style.transition = `transform ${speed}s ease 0s`;
			break;
			case 'reveal':
				style.overflow = 'hidden';
				style.transition = `width ${speed}s ease 0s`;
				if (!this.state.open) style.width = '0px';
				if (this.props.position === 'right') {
					style.left = `${window.innerWidth - style.width.match(/\d+/)[0]}px`;
					style.transition = `left ${speed}s ease 0s${this.state.open ? '' : ', width 0s ease ' + speed + 's'}`;
				}
			break;
			default:
			break;
		}
		
		const defaultProps = {
			className: 'offcanvas-menu'
		}
		
		const menuClose = [];
		if (typeof this.props.closeButton === 'undefined' || this.props.closeButton) {
			menuClose.push(<div key="close-button" onClick={this.closeMenu} style={{position: 'absolute', width: '24px', height: '24px', [position === 'left' ? 'right' : 'left']: '8px', top: '8px'}}><CloseButton color={style.color} /></div>);
		}
		const innerStyle = {width:width};
		if (this.props.type === 'reveal' && this.props.position === 'right') {
			Object.assign(innerStyle,{position: 'absolute',top: '0px', left:this.state.open ? '0px' : `-${width}`,transition:`left ${speed}s ease 0s${this.state.open ? '' : ', width 0s ease ' + speed + 's'}`});
		}

		return(
				<div {...setProps(props,defaultProps)} ref={(c) => { this.offcanvasmenu = c }}>
					<Overlay speed={speed} click-to-close={typeof this.props['click-to-close'] === 'undefined' ? true : this.props['click-to-close']} onClose={this.closeMenu} color={this.props.overlayColor || 'rgb(0,0,0)'} opacity={this.state.open ? (this.props.overlayOpacity || '0.3') : '0'} transition={`background ${speed}s ease 0s${this.state.open ? '' : ' , height 0s ease ' + speed +'s , opacity 0s ease ' + speed + 's'}`} open={this.state.open}>
						<div style={style} ref={(c)=>{this.menu = c}}>
							<div style={innerStyle}>
								 {menuClose}
								 <div style={{width:'100%'}}>
								{this.props.children}
								</div>
							</div>
						</div>
					</Overlay>
				</div>
		);
	}
}

class BurgerMenu extends OffCanvasMenu {
	constructor(props) {
		super(props);
		this.type = this.props.type || 'slide';
		this.state = {
			open: this.props.open || false
		}
	}

	componentDidMount() {
	}

	componentDidUpdate(prevProps,prevState) {
	}
	
	componentWillUnmount() {
	}

	render() {
		const defaultProps = {
			className: 'burger-menu',
			type: this.props.type || 'slide',
			position: 'left',
			speed: '0.5',
			'click-to-close': true
		}
		
		const props = setProps({...this.props},defaultProps,true);
		delete props.fixed;
		delete props.burgerColor;
//		props.push = true;
		if (props.position !== 'left' && props.position !== 'right') {
			console.log('Burger Menu position must be left or right');
			props.position = 'left';
		}
		props.open = this.state.open;
		
		let barNumber = this.props.barNumber || 3;
		let burgerHeight = this.props.burgerHeight || '30px';
		let burgerWidth = this.props.burgerWidth || '36px';
		if (!isNaN(burgerHeight)) burgerHeight = `${burgerHeight}px`;
		if (!isNaN(burgerWidth)) burgerWidth = `${burgerWidth}px`;
		if (isNaN(barNumber) || !Number.isInteger(Number(barNumber)) || Number(barNumber) < 1) {
			console.log('Burger Bar Number must be a positive integer');
//			if (!Number.isInteger(Number(barNumber)) barNumber = floor
			barNumber = Math.floor(Number(barNumber));
			if (isNaN(barNumber) || barNumber < 1) barNumber = 3
		}
		
		const barHeight = 100/(Number(barNumber)+(Number(barNumber)-1));
		const burgerStyles = {
			position: 'absolute',
			height: `${barHeight}%`,
			left: '0px',
			right: '0px',
			background: getRGBA((this.props.burgerColor || 'black'))
		}
		
		const burgerBars = [];
		for (let x=0;x<barNumber;x++) {
			const style = {...burgerStyles}
			style.top = `${(barHeight*x)*2}%`
			burgerBars.push(
						<span key={`burger-bar-${x}`}className="bm-burger-bars" style={style}></span>
			);
		}
		props.hasClosed=()=>{this.setState({open:false},()=>{if(typeof this.props.hasClosed === 'function') this.props.hasClosed()})};
		return(
			<span>
				<OffCanvasMenu {...props}>
				{this.props.children}
				</OffCanvasMenu>
				<div style={{position: this.props.fixed ? 'fixed' : 'absolute', [props.position]: '20px', top: '20px', height: burgerHeight, width: burgerWidth, cursor: 'pointer', zIndex: '10000'}} onClick={this.showMenu}>
					<span>
					{burgerBars}
					</span>
				</div>
			</span>
		);
	}
}

export {Collapse, BurgerMenu, OffCanvasMenu, CloseButton, Popover, PopoverHeader, PopoverBody, Modal, ModalBody, ModalHeader, ModalFooter, DatePicker, Paginator, Spinner, DragAndDrop, Nav};