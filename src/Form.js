import React, {Component} from 'react';

class Form extends Component {
	
	handleSubmit = (event)=> {
		event.preventDefault();

		//Your code here. For example,
		alert("Form submitted");  
	}		
	render() {
		return(
				<form >
					<input type="text"  />
				</form>
		);
	}
}

export default Form;