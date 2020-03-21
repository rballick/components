import React, {Component} from 'react';
import Form from './Form';
import {BurgerMenu,Collapse,Popover,PopoverHeader,PopoverBody,Modal,ModalHeader,ModalBody,ModalFooter,DatePicker,Paginator,Spinner,Nav} from './Components';
import moment from 'moment';
import Promise from 'bluebird';

import './App.css';
import './Popover.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.popover_link = '';
		const defaults = {
			Spinner: {
				size: '',
				strokeWidth: '',
				overlayBackground: '',
				overlayOpacity: '',
				stroke: '',
				time: 5
			},
			Paginator: {
				items: new Array(300),
				item_count: 300,
				perPage: '',
				size: '',
				max: '',
				foregroundColor: '',
				backgroundColor: '',
				'customSize': ''
			},
			DatePicker: {
				styles: ['DatePickerHeader','DatePickerDay'],
				width:'500px',
				startMonday: '',
				dayFormat: '',
				monthFormat: '',
				'month': '',
				'year': '',
				'selected': '',
				'min': '',
				hilightColor: '',
				monthColor: '',
			},
			BurgerMenu: {
				styles: ['BurgerMenu'],
				type: '',
				push: '',
				fixed: '',
				clickToClose: '',
				position: 'left',
				overlayColor: '',
				overlayOpacity: '',
				speed: '',
				barNumber: '',
				burgerHeight: '',
				burgerWidth: '',
				burgerColor: '',
				burgerOpacity: '',
				open: false
			},
			Popover: {
				caller: '#popover-link',
				html: {
					body: '<div>Popover Body</div>',
					header: '<div>Popover Header</div>',
					link: 'popover link'
				},
				styles: ['Popover'],
				link: {
					position: 'relative',
					y: '50px',
					x: '50px',
					yType: 'bottom',
					xType: 'left'
				},
				position: '',
				backgroundColor: '',
				borderColor: '',
				borderWidth: '',
				arrowSize: '',
			},
			Modal : {
				styles: ['Modal','ModalHeader','ModalBody','ModalFooter'],
				html: {
					header: '<h3 style="font-size:1.5em,margin:6px 0">Modal Header</h3>',
					body: '<div style="width:400px;height:300px">Modal Body</div>',
					footer: 'Modal Footer'
				},
				transition: '',
				transitionSpeed: '',
				fullScreen: '',
				overlayColor: '',
				overlayOpacity: '',
				clickToClose: '',
				headerCloseButton: '',
				footerCloseButton: '',
				headerCloseButtonColor: '',
				footerCloseButtonColor: '',
				headerCloseButtonPosition: '',
				footerCloseButtonPosition: '',
			}
		}		
		
		const myProps = {};
		for (const e in defaults) {
			myProps[e] = {};
			for (const k in defaults[e]) {
				if (typeof defaults[e][k] !== 'string' || defaults[e][k] !== '') myProps[e][k] = defaults[e][k];
			}
		}
		this.state = {
			openCollapse: '',
			openElement: '',
			currentPage: 1,
			BurgerMenu: JSON.parse(JSON.stringify(defaults.BurgerMenu)),
			Popover: JSON.parse(JSON.stringify(defaults.Popover)),
			Modal: JSON.parse(JSON.stringify(defaults.Modal)),
			DatePicker: JSON.parse(JSON.stringify(defaults.DatePicker)),
			Paginator: JSON.parse(JSON.stringify(defaults.Paginator)),
			Spinner: JSON.parse(JSON.stringify({...defaults.Spinner,...{open:false}})),
			props: myProps,
			propStyles: {
				Popover: {},
				BurgerMenu: {},
				Modal: {},
				ModalHeader: {},
				ModalBody: {},
				ModalFooter: {},
				DatePickerHeader: {},
				DatePickerDay: {}
			},
			styles: {
				Popover: '{}',
				BurgerMenu: '{}',
				Modal: '{}',
				ModalHeader: '{}',
				ModalBody: '{}',
				ModalFooter: '{}',
				DatePickerHeader: '{}',
				DatePickerDay: '{}'
			}
		}
	}

	openElement = (e) => {
		let component = e.target.dataset.component;
		if (component === this.state[`open${e.target.dataset.type}`]) component = '';
		this.setState({[`open${e.target.dataset.type}`]: component});
	}
	
	updateState = (e) => {
		let obj = this.state[e.target.dataset.component];
		if (typeof e.target.dataset.sub !== 'undefined') obj = obj[e.target.dataset.sub];
		obj = JSON.parse(JSON.stringify(obj));
		obj[e.target.dataset.name] = e.target.value;
		if (typeof e.target.dataset.boolean !== 'undefined') {
			obj[e.target.dataset.name] = Boolean(Number(e.target.value));
		}
		if (typeof e.target.dataset.sub !== 'undefined') obj = {...{...this.state[e.target.dataset.component]},...{[e.target.dataset.sub]: obj}};
//		console.log(obj);
		this.setState({[e.target.dataset.component]:JSON.parse(JSON.stringify(obj))});
	}
	
	updateStyle = (e) => {
		const styles = {...this.state.styles};
		styles[e.target.dataset.component] = e.target.value;
		this.setState({styles: styles});
	}
	
	updateProps = (e) => {
		const props = JSON.parse(JSON.stringify(this.state.props));
		const state = JSON.parse(JSON.stringify(this.state[e.target.dataset.component]));
		props[e.target.dataset.component] = {};
		for (const k in state) {
			if (typeof state[k] !== 'string' || state[k].trim() !== '') {
				props[e.target.dataset.component][k] = state[k];
			}
		}
		if (e.target.dataset.component === 'Spinner') delete props.Spinner.open;
		const data = {props:props};
		if (e.target.dataset.component === 'Paginator') {
			props.Paginator.items = new Array(Number(props.Paginator.item_count));
			if (props.Paginator.size === 'custom') props.Paginator.size = state.customSize;
		}
		const styles = JSON.parse(JSON.stringify(this.state.propStyles));
		if (typeof this.state[e.target.dataset.component].styles === 'object') {
			this.state[e.target.dataset.component].styles.forEach((component) => {
				const cstyle = {};
				let style = this.state.styles[component];
				style = style.replace(/[\n\t'"]/g,'');
				style = style.substring(style.indexOf('{')+1,style.lastIndexOf('}'));
				let o = 0;
				let b = 0;
				while (o > -1) {
					o = style.indexOf(':',style.indexOf(':',o)+1);
					e = o === -1 ? style.length : Math.max(style.lastIndexOf(',',o),style.lastIndexOf(';',o));
					const s = style.substring(b,e).split(':');
					if (s.length === 2) {
						s[1] = s[1].trim();
						if (s[1].charAt(s[1].length-1) === ';') s[1] = s[1].substring(0,s[1].length-1);
						let matches = s[0].match(/-\w/g);
						if (matches) {
							matches.forEach((match) => {
								s[0] = s[0].replace(match,match.charAt(1).toUpperCase());
							});
						}
						cstyle[s[0].trim()] = s[1].trim();
					}
					b = e + 1;
				}
				styles[component] = cstyle;
				data.propStyles = styles;
			});
		}
		this.setState(data);
	}
	
	transitionSpeed = (e) => {
		const target = e.target;
		const obj = JSON.parse(JSON.stringify(this.state[e.target.dataset.component]));
		obj.transitionSpeed = e.target.dataset.speed;
		this.setState({[e.target.dataset.component]: obj},(e)=>{this.updateState({target: target})});
	}
	
	selectDate = (date) => {
		date = moment(date).format('M/D/YYYY');
		const props = JSON.parse(JSON.stringify(this.state.props));
		const state = JSON.parse(JSON.stringify(this.state.DatePicker));
		state.selected = date;
		props.DatePicker.selected = date;
		this.setState({props:props,DatePicker:state});
	}
	
	selectPage = (page) => {
//		this.setState
	}
	
	showSpinner = () => {
		const spinner = {...this.state.Spinner};
		spinner.open = true;
		this.setState({Spinner: spinner},() => {
			spinner.open = false;
			setTimeout(() => {this.setState({Spinner:spinner})},this.state.Spinner.time * 1000);
		});
	}
	
	spinnerTime = (e) => {
		const spinner = {...this.state.Spinner};
		spinner.time = e.target.value;
		this.setState({Spinner: spinner});
	}
	
	onOpen = () => {
		return;
		alert('onOpen');
	}
	
	onClose = () => {
		return;
		alert('onClose');
	}
	
	hasOpened = () => {
		console.log('hasOpened');
	}
	
	hasClosed = () => {
		console.log('hasClosed');
	}
	onMount = () => {
		console.log('onMount');
	}
	onUnmount = () => {
		console.log('onUnmount');
	}
	
	componentDidMount() {
		const openCollapse = this.state.openCollapse;
		if (openCollapse.length > 0 && typeof this.state.props[openCollapse].html !=='undefined') {
			const html = this.state.props[openCollapse].html;
			for (const key in html) {
				if (this[`${openCollapse}_${key}`] !== null && html[key].trim() !== this[`${openCollapse}_${key}`].innerHTML) this[`${openCollapse}_${key}`].innerHTML = html[key].trim();
			}
		}
	}
	
	componentDidUpdate(prevProps, prevState) {
		const openCollapse = this.state.openCollapse;
		if (openCollapse.length > 0 && typeof this.state.props[openCollapse].html !=='undefined') {
			const html = this.state.props[openCollapse].html;
			for (const key in html) {
				if (this[`${openCollapse}_${key}`] !== null && html[key].trim() !== this[`${openCollapse}_${key}`].innerHTML) this[`${openCollapse}_${key}`].innerHTML = html[key].trim();
			}
		}
	}
	
	render() {
		const burgerMenu = [];
		if (this.state.openCollapse === 'BurgerMenu') {
			burgerMenu.push(
		<BurgerMenu key="burgerMenu" id="burgerMenu" className="myclass" style={this.state.propStyles.BurgerMenu} {...this.state.props.BurgerMenu} onMount={this.onMount} onUnmount={this.onUnmount} onOpen={this.onOpen} onClose={this.onClose} hasOpened={this.hasOpened} hasClosed={this.hasClosed}>
				<div style={{padding:'12px'}}>
					<h1>Menu</h1>
					<div className="menu-group current-date">Thursday, Jan 23rd 2020</div>
					<div className="calendarLinks"><span className="icon oi oi-caret-left caller prev-date" aria-hidden="true"><span className="srOnly">back 1 day</span></span><span className="icon" data-form="dateChange" data-date="01/23/2020"><span className="oi oi-calendar caller"><span className="srOnly">change date</span></span>
						</span><span className="icon oi oi-caret-right caller next-date" aria-hidden="true"><span className="srOnly">ahead 1 day</span></span>
					</div>
					<div className="menuGroup">
						<div>There are 3 uncompleted tasks</div>
						<div className="menuGroup">
							<div className="menuItem" data-from="20200123">Bring forward all</div>
						</div>
					</div>
					<div className="menu-group menu-item">Refresh Page</div>
				</div>
			</BurgerMenu>
			);
		}
		const popover = [];
		const popoverLink = [];
		if (this.state.openCollapse === 'Popover') {
			const popoverHeader = [];
			const popoverBody = [];
			const props = {...this.state.props.Popover};
			const popoverLinkStyle = {
				position: props.link.position,
				cursor:'pointer'
			};
			
			if (props.link.position !== 'relative') {
				popoverLinkStyle[props.link.xType] = props.link.x;
				popoverLinkStyle[props.link.yType] = props.link.y;
			}
			popoverLink.push(<div key="popoverLink "style={popoverLinkStyle}><a id="popover-link" onClick={this.openElement} data-type="Element" data-component="popover" ref={(e)=>this.Popover_link = e}></a></div>);
			if (props.html.header.length > 0) {
				popoverHeader.push(<PopoverHeader key="Popover_header"><span ref={(e)=>this.Popover_header = e}></span></PopoverHeader>);
				if (props.html.body.length > 0) {
					popoverBody.push(<PopoverBody key="Popover_body"><span ref={(e)=>this.Popover_body = e}></span></PopoverBody>);
				}
			} else if (props.html.body.length > 0) {
				popoverBody.push(<span key="Popover_body" ref={(e)=>this.Popover_body = e}></span>);
			}
			delete props.link;
			delete props.html;		
			popover.push(
			<div key="popover">
				<Popover id="myPopover" {...props} style={this.state.propStyles.Popover} open={this.state.openElement === 'popover'} onMount={this.onMount} onUnmount={this.onUnmount} onOpen={this.onOpen} onClose={this.onClose} hasOpened={this.hasOpened} hasClosed={this.hasClosed}>
					{popoverHeader}
					{popoverBody}
				</Popover>
			</div>
			);

		} else {
			popoverLink.push(<a key="popover-link" id="popover-link"></a>);
		}
		const modal = [];
		if (this.state.openCollapse === 'Modal') {
			const modalHeader = [];
			const modalBody = [];
			const modalFooter = [];
			if (this.state.props.Modal.html.header.length > 0) {
				modalHeader.push(<ModalHeader style={this.state.propStyles.ModalHeader} key="modalHeader" close-button={this.state.Modal.headerCloseButton} close-position={this.state.Modal.headerCloseButtonPosition} close-button-color={this.state.Modal.headerCloseButtonColor} onClose={()=>{this.setState({openElement:''})}}><span ref={(e)=>this.Modal_header=e}></span></ModalHeader>);
			}
			if (this.state.props.Modal.html.body.length > 0) {
				modalBody.push(<ModalBody style={this.state.propStyles.ModalBody} key="modalBody"><span ref={(e)=>this.Modal_body=e}></span></ModalBody>);
			}
			if (this.state.props.Modal.html.footer.length > 0) {
				modalFooter.push(<ModalFooter style={this.state.propStyles.ModalFooter} key="modalFooter" close-button={this.state.Modal.footerCloseButton} close-position={this.state.Modal.headerCloseButtonPosition} close-button-color={this.state.Modal.footerCloseButtonColor} onClose={()=>{this.setState({openElement:''})}}><span ref={(e)=>this.Modal_footer=e}></span></ModalFooter>);
			}
			
			modal.push(
			<Modal key="modal" style={this.state.propStyles.Modal} open={this.state.openElement === 'modal'} hasClosed={()=>{this.setState({openElement:''})}} {...this.state.props.Modal} onMount={this.onMount} onUnmount={this.onUnmount} onOpen={this.onOpen} onClose={this.onClose} hasOpened={this.hasOpened}>
				{modalHeader}
				{modalBody}
				{modalFooter}
			</Modal>
			);
		}
		const spinner = [];
		if (this.state.openCollapse === 'Spinner') {
			spinner.push(<Spinner key="spinner" open={this.state.Spinner.open} {...this.state.props.Spinner} />);
		}
		return(
        <div className="container" style={{width:'auto',width:'auto'}}>
			{burgerMenu}
			{popover}
			{modal}
			{spinner}
			<div style={{width:'75%',margin:'auto',height:'800px'}}>
				<div style={{height:'auto'}}>
					<Nav links={['Tab 1',<div>Tab 2</div>,<span>Tab 3</span>]} active={1} stacked={true} />
					<Nav links={['Tab 1',<div>Tab 2</div>,<div>Tab 3</div>]} active={1} stacked={false} panelstyle={{border:'1px solid grey',borderTopStyle:'none'}}>
						<div>Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 Tab 1 </div>
						<div>Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 Tab 2 </div>
						<div>Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 Tab 3 </div>
					</Nav>
				</div>
				<div style={{height:'auto'}}>
					<div><h3><a onClick={this.openElement} data-type='Collapse' data-component="Spinner">Spinner</a></h3></div>
					<Collapse open={this.state.openCollapse === 'Spinner'} id="SpinnerCollapse" onMount={this.onMount} onUnmount={this.onUnmount} onOpen={this.onOpen} onClose={this.onClose} hasOpened={this.hasOpened} hasClosed={this.hasClosed}>
						<div><label>Size: </label> {this.state.props.Spinner.size} <label>Change: </label> <input type="number" value={this.state.Spinner.size} data-component="Spinner" data-name="size" onChange={this.updateState} />px default 32px</div>
						<div><label>Stroke Width: </label> {this.state.props.Spinner.strokeWidth} <label>Change: </label> <input type="number" value={this.state.Spinner.strokeWidth} data-component="Spinner" data-name="strokeWidth" onChange={this.updateState} />px default 3px</div>
						<div><label>Overlay Background Color: </label> {this.state.props.Spinner.overlayBackground} <label>Change: </label> <input type="text" value={this.state.Spinner.overlayBackground} data-component="Spinner" data-name="overlayBackground" onChange={this.updateState} /> default is white</div>
						<div><label>Overlay Opacity: </label> {this.state.props.Spinner.overlayOpacity} <label>Change: </label> <input type="text" value={this.state.Spinner.overlayOpacity} data-component="Spinner" data-name="overlayOpacity" onChange={this.updateState} /> default is 0.6</div>
						<div><label>Stroke Color: </label> {this.state.props.Spinner.stroke} <label>Change: </label> <input type="text" value={this.state.Spinner.stroke} data-component="Spinner" data-name="stroke" onChange={this.updateState} /> default is blue</div>
						<div><input type="button" onClick={this.updateProps} data-component="Spinner" value="Update" /></div>
						<div><a onClick={this.showSpinner} style={{cursor:'pointer',textDecoration:'underline'}}>show spinner</a> for <input type="number" value={this.state.Spinner.time} onChange={this.spinnerTime} /> seconds</div>
					</Collapse>
				</div>
				<div style={{height:'auto'}}>
					<div><h3><a onClick={this.openElement} data-type='Collapse' data-component="Paginator">Paginator</a></h3></div>
					<Collapse open={this.state.openCollapse === 'Paginator'} id="PaginatorCollapse">
						<div><label>No. of Items: </label>{this.state.props.Paginator.item_count} <label>Change: </label><input type="number" data-name="item_count" value={this.state.Paginator.item_count} data-component="Paginator" onChange={this.updateState} /></div>
						<div><label>Size: </label>{this.state.props.Paginator.size} <label>Change: </label>
							<select data-component="Paginator" data-name="size" onChange={this.updateState} value={this.state.Paginator.size}>
								<option value=""></option>
								<option value="small">small</option>
								<option value="medium">medium</option>
								<option value="large">large</option>
								<option value="xLarge">x-large</option>
								<option value="custom">Custom</option>
							</select> default is large (30)
							<Collapse open={this.state.Paginator.size === 'custom'} style={{marginTop:'3px',marginBottom:'3px'}}>
								<div><label>Custom Size: </label><input type="number" data-name="customSize" value={this.state.Paginator.customSize} data-component="Paginator" onChange={this.updateState} /></div>
							</Collapse>
						</div>
						<div><label>Items per Page: </label>{this.state.props.Paginator.perPage} <label>Change: </label><input type="number" data-name="perPage" value={this.state.Paginator.perPage} data-component="Paginator" onChange={this.updateState} /> default is 10</div>
						<div><label>Max Pages: </label>{this.state.props.Paginator.max} <label>Change: </label><input type="number" data-name="max" value={this.state.Paginator.max} data-component="Paginator" onChange={this.updateState} /> default is 20</div>
						<div><label>Foreground Color: </label>{this.state.props.Paginator.foregroundColor} <label>Change: </label><input type="text" data-name="foregroundColor" value={this.state.Paginator.foregroundColor} data-component="Paginator" onChange={this.updateState} /> default is white</div>
						<div><label>Background Color: </label>{this.state.props.Paginator.backgroundColor} <label>Change: </label><input type="text" data-name="backgroundColor" value={this.state.Paginator.backgroundColor} data-component="Paginator" onChange={this.updateState} /> default is #007bff</div>
						<div><input type="button" onClick={this.updateProps} data-component="Paginator" value="Update" /></div>
						<div><Paginator {...this.state.props.Paginator} onSelect={this.selectDate} /></div>
					</Collapse>
				</div>
				<div style={{height:'auto'}}>
					<div><h3><a onClick={this.openElement} data-type='Collapse' data-component="DatePicker">Date-Picker</a></h3></div>
					<Collapse open={this.state.openCollapse === 'DatePicker'} id="DatePickerCollapse">
						<div><label>Selected: </label>{this.state.props.DatePicker.selected} <label>Change: </label><input type="text" data-name="selected" value={this.state.DatePicker.selected} data-component="DatePicker" onChange={this.updateState} /></div>
						<div><label>Week Start: </label>{this.state.props.DatePicker.startMonday ? 'Monday' : 'Sunday'} <label>Change: </label>
							<span><input type="radio" data-name="startMonday" data-boolean value={0} data-component="DatePicker" checked={this.state.DatePicker.startMonday === false} onChange={this.updateState} /> Sunday</span>
							<span><input type="radio" data-name="startMonday" data-boolean value={1} data-component="DatePicker" checked={this.state.DatePicker.startMonday === true} onChange={this.updateState} /> Monday</span> defult is Sunday
						</div>
						<div><label>Day of Week Format: </label>{this.state.props.DatePicker.dayFormat} <label>Change: </label><input type="text" data-name="dayFormat" value={this.state.DatePicker.dayFormat} data-component="DatePicker" onChange={this.updateState} /> (d, dd,ddd, dddd) default is ddd</div>
						<div><label>Month/Year Format: </label>{this.state.props.DatePicker.headerFormat} <label>Change: </label><input type="text" data-name="monthFormat" value={this.state.DatePicker.monthFormat} data-component="DatePicker" onChange={this.updateState} /> default is MMMM YYYY</div>
						<div><label>Start Month: </label>{this.state.props.DatePicker.month} <label>Change: </label><input type="text" data-name="month" value={this.state.DatePicker.month} data-component="DatePicker" onChange={this.updateState} /> default is current month</div>
						<div><label>Start Year: </label>{this.state.props.DatePicker.year} <label>Change: </label><input type="text" data-name="year" value={this.state.DatePicker.year} data-component="DatePicker" onChange={this.updateState} /> default is current year</div>
						<div><label>Min Date: </label>{this.state.props.DatePicker.min} <label>Change: </label><input type="text" data-name="min" value={this.state.DatePicker.min} data-component="DatePicker" onChange={this.updateState} /></div>
						<div><label>Max Date: </label>{this.state.props.DatePicker.max} <label>Change: </label><input type="text" data-name="max" value={this.state.DatePicker.max} data-component="DatePicker" onChange={this.updateState} /></div>
						<div><label>Hilight Color: </label>{this.state.props.DatePicker.hilightColor} <label>Change: </label><input type="text" data-name="hilightColor" value={this.state.DatePicker.hilightColor} data-component="DatePicker" onChange={this.updateState} /> default is #007bff</div>
						<div><label>Month Font Color: </label>{this.state.props.DatePicker.monthColor} <label>Change: </label><input type="text" data-name="monthColor" value={this.state.DatePicker.monthColor} data-component="DatePicker" onChange={this.updateState} /> default is white</div>
						<div><label>Header Style: </label>{JSON.stringify(this.state.propStyles.DatePickerHeader)} <label>Change: </label><br /><textarea value={this.state.styles.DatePickerHeader} data-component="DatePickerHeader" onChange={this.updateStyle} /></div>
						<div><label>Day Cell Style: </label>{JSON.stringify(this.state.propStyles.DatePickerDay)} <label>Change: </label><br /><textarea value={this.state.styles.DatePickerDay} data-component="DatePickerDay" onChange={this.updateStyle} /></div>
						<div><label>Width: </label>{this.state.props.DatePicker.width} <label>Change: </label><input type="text" data-name="width" value={this.state.DatePicker.width} data-component="DatePicker" onChange={this.updateState} /> for testing</div>

						<div><input type="button" onClick={this.updateProps} data-component="DatePicker" value="Update" /></div>
						<div style={{width:this.state.props.DatePicker.width}}>
							<DatePicker {...this.state.props.DatePicker} onSelect={this.selectDate} />
						</div>
					</Collapse>
				</div>
				<div style={{height:'auto'}}>
					<div><h3><a onClick={this.openElement} data-type='Collapse' data-component="BurgerMenu">Burger Menu</a></h3></div>
					<Collapse open={this.state.openCollapse === 'BurgerMenu'} id="BurgerMenuCollapse">
						<div><label>Type: </label>{this.state.props.BurgerMenu.type} <label>Change: </label>
							<select data-component="BurgerMenu" data-name="type" onChange={this.updateState} value={this.state.BurgerMenu.type}>
								<option value=""></option>
								<option value="reveal">reveal</option>
								<option value="slide">slide</option>
							</select> default is slide
						</div>
						<div><label>Position: </label>{this.state.props.BurgerMenu.position} <label>Change: </label>
							<span><input type="radio" name="burgermenuPosition" data-name="position" value="left" data-component="BurgerMenu" checked={this.state.BurgerMenu.position === 'left'} onChange={this.updateState} /> left</span>
							<span><input type="radio" name="burgermenuPosition" data-name="position"  value="right" data-component="BurgerMenu" checked={this.state.BurgerMenu.position === 'right'} onChange={this.updateState} /> right</span> default is left
						</div>
						<div><label>Fixed: </label>{this.state.props.BurgerMenu.fixed !== undefined ? this.state.props.BurgerMenu.fixed.toString() : ''} <label>Change: </label>
							<span><input type="radio" name="burgermenuFixed" data-name="fixed" data-boolean value={1} data-component="BurgerMenu" checked={this.state.BurgerMenu.fixed === true} onChange={this.updateState} /> Yes</span>
							<span><input type="radio" name="burgermenuFixed" data-name="fixed" data-boolean value={0} data-component="BurgerMenu" checked={this.state.BurgerMenu.fixed === false} onChange={this.updateState} /> No</span> default is No
						</div>
						<div><label>Push: </label>{this.state.props.BurgerMenu.push !== undefined ? this.state.props.BurgerMenu.push.toString() : ''} <label>Change: </label>
							<span><input type="radio" name="burgermenuPush" data-name="push" data-boolean value={1} data-component="BurgerMenu" checked={this.state.BurgerMenu.push === true} onChange={this.updateState} /> Yes</span>
							<span><input type="radio" name="burgermenuPush" data-name="push" data-boolean value={0} data-component="BurgerMenu" checked={this.state.BurgerMenu.push === false} onChange={this.updateState} /> No</span> default is No
						</div>
						<div><label>Speed: </label>{this.state.props.BurgerMenu.speed} seconds <label>Change: </label><input type="text" data-name="speed" value={this.state.BurgerMenu.speed} data-component="BurgerMenu" onChange={this.updateState} />s default is .5s</div>
						<div><label>Click To Close: </label>{this.state.props.BurgerMenu.clickToClose !== undefined ? this.state.props.BurgerMenu.clickToClose.toString() : ''} <label>Change: </label>
							<span><input type="radio" name="burgermenuClickTpClose" data-name="clickToClose" data-boolean value={1} data-component="BurgerMenu" checked={this.state.BurgerMenu.clickToClose === true} onChange={this.updateState} /> Yes</span>
							<span><input type="radio" name="burgermenuClickTpClose" data-name="clickToClose" data-boolean value={0} data-component="BurgerMenu" checked={this.state.BurgerMenu.clickToClose === false} onChange={this.updateState} /> No</span> default is Yes
						</div>
						<div><label>Overlay Color: </label>{this.state.props.BurgerMenu.overlayColor} <label>Change: </label><input type="text" data-name="overlayColor" value={this.state.BurgerMenu.overlayColor} data-component="BurgerMenu" onChange={this.updateState} /> default is black</div>
						<div><label>Overlay Opacity: </label>{this.state.props.BurgerMenu.overlayOpacity} <label>Change: </label><input type="text" data-name="overlayOpacity" value={this.state.BurgerMenu.overlayOpacity} data-component="BurgerMenu" onChange={this.updateState} /> default is .3</div>
						<div><label>Burger Bar Number: </label>{this.state.props.BurgerMenu.barNumber} <label>Change: </label><input type="text" data-name="barNumber" value={this.state.BurgerMenu.barNumber} data-component="BurgerMenu" onChange={this.updateState} /> default is 3</div>
						<div><label>Burger Height: </label>{this.state.props.BurgerMenu.burgerHeight} <label>Change: </label><input type="text" data-name="burgerHeight" value={this.state.BurgerMenu.burgerHeight} data-component="BurgerMenu" onChange={this.updateState} /> default is 30px</div>
						<div><label>Burger Width: </label>{this.state.props.BurgerMenu.burgerWidth} <label>Change: </label><input type="text" data-name="burgerWidth" value={this.state.BurgerMenu.burgerWidth} data-component="BurgerMenu" onChange={this.updateState} /> default is 36px</div>
						<div><label>Burger Color: </label>{this.state.props.BurgerMenu.burgerColor} <label>Change: </label><input type="text" data-name="burgerColor" value={this.state.BurgerMenu.burgerColor} data-component="BurgerMenu" onChange={this.updateState} /> default is black</div>
						<div><label>Menu Style: </label>{JSON.stringify(this.state.propStyles.BurgerMenu)} <label>Change: </label><br /><textarea value={this.state.styles.BurgerMenu} data-component="BurgerMenu" onChange={this.updateStyle} /></div>
						<div><input type="button" onClick={this.updateProps} data-component="BurgerMenu" value="Update" /></div>
					</Collapse>
				</div>
				<div style={{height:'auto'}}> 
					<div><h3><a onClick={this.openElement} data-type='Collapse' data-component="Popover" id="PopoverCollapse">Popover</a></h3></div>
					<Collapse open={this.state.openCollapse === 'Popover'} ref={(e)=>{this.popoverCollapse = e}}>
						<div><label>Link Position: </label>{this.state.props.Popover.link.position} <label>Change: </label>
							<span><input type="radio" name="popoverLinkPosition" data-name="position" value="absolute" data-component="Popover" checked={this.state.Popover.link.position === 'absolute'} data-sub="link" onChange={this.updateState} /> absolute</span>
							<span><input type="radio" name="popoverLinkPosition" data-name="position" value="fixed" data-component="Popover" checked={this.state.Popover.link.position === 'fixed'} data-sub="link" onChange={this.updateState} /> fixed</span>
							<span><input type="radio" name="popoverLinkPosition" data-name="position" value="relative" data-component="Popover" data-sub="link" checked={this.state.Popover.link.position === 'relative'}  onChange={this.updateState} /> relative</span> 
							<Collapse open={this.state.Popover.link.position !== 'relative'} style={{marginBottom:'3px'}}>
								<div>
									<label>X Position: </label> 
									{this.state.props.Popover.link.xType}  {this.state.props.Popover.link.x} 
									<label>Change: </label>
									<select data-component="Popover" data-sub="link" data-name="xType" onChange={this.updateState} value={this.state.Popover.link.xType}>
										<option value="left">left</option>
										<option value="right">right</option>
									</select>
									<input type="text" data-name="x" value={this.state.Popover.link.x} data-component="Popover" data-sub="link" onChange={this.updateState} /> 
								</div>
								<div>
									<label>Y Position: </label> 
									{this.state.props.Popover.link.yType}  {this.state.props.Popover.link.y} 
									<label>Change: </label>
									<select data-component="Popover" data-sub="link" data-name="yType" onChange={this.updateState} value={this.state.Popover.link.yType}>
										<option value="bottom">bottom</option>
										<option value="top">top</option>
									</select>
									<input type="text" data-name="y" value={this.state.Popover.link.y} data-component="Popover" data-sub="link" onChange={this.updateState} /> 
								</div>
							</Collapse>
						</div>
						<div><label>Link HTML: </label>{this.state.props.Popover.html.link} <label>Change: </label><br /><textarea data-name="link" data-sub="html" value={this.state.Popover.html.link} data-component="Popover" onChange={this.updateState} /></div>
						<div><label>Popover HTML: </label></div>
						<div>
							<label>Header: </label>: {this.state.props.Popover.html.header}
							<label>Change: </label><br /><textarea data-name="header" data-sub="html" value={this.state.Popover.html.header} data-component="Popover" onChange={this.updateState} />
						</div>
						<div>
							<label>Body: </label>: {this.state.props.Popover.html.body}
							<label>Change: </label><br /><textarea data-name="body" data-sub="html" value={this.state.Popover.html.body} data-component="Popover" onChange={this.updateState} />
						</div>
						<div>(for testing purposes)</div>
						<div><label>Position: </label>{this.state.props.Popover.position} <label>Change: </label>
							<select data-component="Popover" data-name="position" onChange={this.updateState} value={this.state.Popover.position}>
								<option value=""></option>
								<option value="bottom">bottom</option>
								<option value="left">left</option>
								<option value="right">right</option>
								<option value="top">top</option>
							</select> default is bottom
						</div>
						<div>
							<label>Background Color: </label>: {this.state.props.Popover.backgroundColor}
							<label>Change: </label><input type="text" data-name="backgroundColor" value={this.state.Popover.backgroundColor} data-component="Popover" onChange={this.updateState} /> default is white
						</div>
						<div>
							<label>Border Color: </label>: {this.state.props.Popover.borderColor}
							<label>Change: </label><input type="text" data-name="borderColor" value={this.state.Popover.borderColor} data-component="Popover" onChange={this.updateState} /> default is #ddd
						</div>
						<div>
							<label>Border Width: </label>: {this.state.props.Popover.borderWidth}
							<label>Change: </label><input type="text" data-name="borderWidth" value={this.state.Popover.borderWidth} data-component="Popover" onChange={this.updateState} /> default is 1px
						</div>
						<div>
							<label>Arrow Height: </label>: {this.state.props.Popover.arrowSize}
							<label>Change: </label><input type="text" data-name="arrowSize" value={this.state.Popover.arrowSize} data-component="Popover" onChange={this.updateState} /> default is 10px
						</div>
						<div><label>Popover Content Style: </label>{JSON.stringify(this.state.propStyles.Popover)} <label>Change: </label><br /><textarea value={this.state.styles.Popover} data-component="Popover" onChange={this.updateStyle} /></div>
						<div><input type="button" onClick={this.updateProps} data-component="Popover" value="Update" /></div>
						{popoverLink}
					</Collapse>
				</div>
				<div style={{height:'auto'}}> 
					<div><h3><a onClick={this.openElement} data-type='Collapse' data-component="Modal" id="ModalCollapse">Modal</a></h3></div>
					<Collapse open={this.state.openCollapse === 'Modal'} ref={(e)=>{this.modalCollapse = e}}>
						<div><label>Transition: </label>{this.state.props.Modal.transition === '' ? 'none' : this.state.props.Modal.transition} <label>Change: </label>
							<span><input type="radio" name="modalTransition" data-speed=".5s" data-name="transition" value="drop" data-component="Modal" checked={this.state.Modal.transition === 'drop'} onChange={this.transitionSpeed} /> drop</span>
							<span><input type="radio" name="modalTransition" data-speed="3s" data-name="transition" value="fade" data-component="Modal" checked={this.state.Modal.transition === 'fade'} onChange={this.transitionSpeed} /> fade</span>
							<span><input type="radio" name="modalTransition" data-name="transition" value="" data-component="Modal" checked={this.state.Modal.transition === ''} onChange={this.updateState} /> none</span> 
						</div>
						<Collapse open={this.state.Modal.transition === 'drop' || this.state.Modal.transition === 'fade'}>
							<div>
								<label>Transition Speed: </label>: {this.state.props.Modal.transitionSpeed}
								<label>Change: </label><input type="text" data-name="transitionSpeed" value={this.state.Modal.transitionSpeed} data-component="Modal" onChange={this.updateState} /> default is <span>{this.state.Modal.transition === 'drop' ? '.5s' : '3s'}</span>
							</div>
						</Collapse>
						<div><label>Full Screen: </label>{this.state.props.Modal.fullScreen !== undefined ? this.state.props.Modal.fullScreen.toString() : ''} <label>Change: </label>
							<span><input type="radio" name="modalFullScreen" data-name="fullScreen" data-boolean value={1} data-component="Modal" checked={this.state.Modal.fullScreen === true} onChange={this.updateState} /> Yes</span>
							<span><input type="radio" name="modalFullScreen" data-name="fullScreen" data-boolean value={0} data-component="Modal" checked={this.state.Modal.fullScreen === false} onChange={this.updateState} /> No</span> default is No
						</div>
						<div><label>Overlay Color: </label>{this.state.props.Modal.overlayColor} <label>Change: </label><input type="text" data-name="overlayColor" value={this.state.Modal.overlayColor} data-component="Modal" onChange={this.updateState} /> default is black</div>
						<div><label>Overlay Opacity: </label>{this.state.props.Modal.overlayOpacity} <label>Change: </label><input type="text" data-name="overlayOpacity" value={this.state.Modal.overlayOpacity} data-component="Modal" onChange={this.updateState} /> default is .3</div>
						<div><label>Click To Close: </label>{this.state.props.Modal.clickToClose !== undefined ? this.state.props.Modal.clickToClose.toString() : ''} <label>Change: </label>
							<span><input type="radio" name="modalClickTpClose" data-name="clickToClose" data-boolean value={1} data-component="Modal" checked={this.state.Modal.clickToClose === true} onChange={this.updateState} /> Yes</span>
							<span><input type="radio" name="modalClickTpClose" data-name="clickToClose" data-boolean value={0} data-component="Modal" checked={this.state.Modal.clickToClose === false} onChange={this.updateState} /> No</span> default is Yes
						</div>
						<div><label>Modal Style: </label>{JSON.stringify(this.state.propStyles.Modal)} <label>Change: </label><br /><textarea value={this.state.styles.Modal} data-component="Modal" onChange={this.updateStyle} /></div>
						<div>
							<label>Header: </label>: {this.state.props.Modal.html.header}
							<label>Change: </label><br /><textarea data-name="header" data-sub="html" value={this.state.Modal.html.header} data-component="Modal" onChange={this.updateState} />
							<div><label>Close Button: </label>{this.state.props.Modal.headerCloseButton !== undefined ? this.state.props.Modal.headerCloseButton.toString() : ''} <label>Change: </label>
								<span><input type="radio" name="modalHeaderCloseButton" data-name="headerCloseButton" data-boolean value={1} data-component="Modal" checked={this.state.Modal.headerCloseButton === true} onChange={this.updateState} /> Yes</span>
								<span><input type="radio" name="modalHeaderCloseButton" data-name="headerCloseButton" data-boolean value={0} data-component="Modal" checked={this.state.Modal.headerCloseButton === false} onChange={this.updateState} /> No</span> default is Yes
								<span style={{display:this.state.Modal.headerCloseButton?'inline':'none'}}>
									<label>Position: </label>{this.state.props.Modal.headerCloseButtonPosition} <label>Change: </label>
									<span><input type="radio" name="modalHeaderCloseButtonPosition" data-name="headerCloseButtonPosition" value="left" data-component="Modal" checked={this.state.Modal.headerCloseButtonPosition === 'left'} onChange={this.updateState} /> left</span>
									<span><input type="radio" name="modalHeaderCloseButtonPosition" data-name="headerCloseButtonPosition" value="right" data-component="Modal" checked={this.state.Modal.headerCloseButtonPosition === 'right'} onChange={this.updateState} /> right</span> default is right
									<label>Button Color: </label>{this.state.props.Modal.headerCloseButtonColor} <label>Change: </label><input type="text" data-name="headerCloseButtonColor" value={this.state.Modal.headerCloseButtonColor} data-component="Modal" onChange={this.updateState} /> default is black
								</span>
							</div>
							<div><label>Header Style: </label>{JSON.stringify(this.state.propStyles.ModalHeader)} <label>Change: </label><br /><textarea value={this.state.styles.ModalHeader} data-component="ModalHeader" onChange={this.updateStyle} /></div>
						</div>
						<div>
							<label>Body: </label>: {this.state.props.Modal.html.body}
							<label>Change: </label><br /><textarea data-name="body" data-sub="html" value={this.state.Modal.html.body} data-component="Modal" onChange={this.updateState} />
							<div><label>Body Style: </label>{JSON.stringify(this.state.propStyles.ModalBody)} <label>Change: </label><br /><textarea value={this.state.styles.ModalBody} data-component="ModalBody" onChange={this.updateStyle} /></div>
						</div>
						<div>
							<label>Footer: </label>: {this.state.props.Modal.html.footer}
							<label>Change: </label><br /><textarea data-name="footer" data-sub="html" value={this.state.Modal.html.footer} data-component="Modal" onChange={this.updateState} />
							<div><label>Close Button: </label>{this.state.props.Modal.footerCloseButton !== undefined ? this.state.props.Modal.footerCloseButton.toString() : ''} <label>Change: </label>
								<span><input type="radio" name="modalFooterCloseButton" data-name="footerCloseButton" data-boolean value={1} data-component="Modal" checked={this.state.Modal.footerCloseButton === true} onChange={this.updateState} /> Yes</span>
								<span><input type="radio" name="modalFooterCloseButton" data-name="footerCloseButton" data-boolean value={0} data-component="Modal" checked={this.state.Modal.footerCloseButton === false} onChange={this.updateState} /> No</span> default is No
								<span style={{display:this.state.Modal.footerCloseButton?'inline':'none'}}>
									<label>Position: </label>{this.state.props.Modal.footerCloseButtonPosition} <label>Change: </label>
									<span><input type="radio" name="modalFooterCloseButtonPosition" data-name="footerCloseButtonPosition" value="left" data-component="Modal" checked={this.state.Modal.footerCloseButtonPosition === 'left'} onChange={this.updateState} /> left</span>
									<span><input type="radio" name="modalFooterCloseButtonPosition" data-name="footerCloseButtonPosition" value="left" data-component="Modal" checked={this.state.Modal.footerCloseButtonPosition === 'right'} onChange={this.updateState} /> right</span> default is right
									<label>Button Color: </label>{this.state.props.Modal.footerCloseButtonColor} <label>Change: </label><input type="text" data-name="footerCloseButtonColor" value={this.state.Modal.footerCloseButtonColor} data-component="Modal" onChange={this.updateState} /> default is black
								</span>
							</div>
							<div><label>Footer Style: </label>{JSON.stringify(this.state.propStyles.ModalFooter)} <label>Change: </label><br /><textarea value={this.state.styles.ModalFooter} data-component="ModalFooter" onChange={this.updateStyle} /></div>
						</div>
						<div><input type="button" onClick={this.updateProps} data-component="Modal" value="Update Modal" /></div>
						<div key="modalLink"><a id="modalLink" onClick={this.openElement} data-type="Element" data-component="modal">open modal</a></div>
					</Collapse>
				</div>
			</div>
        </div>
		);
	}
}

export default App;