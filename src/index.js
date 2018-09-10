import React from 'react';
import ReactDOM from 'react-dom';
import abi from './contract.json';
import Web3 from 'web3'

var provider = new Web3.providers.HttpProvider()

const web3 = new window.Web3(provider);//

//const web3 = new Web3(window.web3.currentProvider);
const contract = web3.eth.contract(abi).at('0x6965E0A2759588579994771d14d8bA568863628f');
web3.eth.defaultAccount = web3.eth.accounts[0];

const range = (n) => [...Array(n).keys()]

class App extends React.Component {

	state = {
		apps: []
	}

	componentDidMount() {
		var event = contract.Added();

	    event.watch((ee, results) => {
	    	this.loadData();
	    })   

	    this.loadData();
	}

	loadData = () => {
		contract.appsCount((e, data) => {
			const length = data.toNumber();
			const requests = range(length).map(index => 
				new Promise(resolve => 
					contract.apps(index, (e, data) => 
						resolve({
							name: data[0], 
							description: data[1]
						})
					)
				)
			);

			Promise.all(requests).then(apps => {
				this.setState({ apps });  
			})
		})
		
	}

	addApp = () => {

		var name = this.refs.nameIn.value;
		var descr = this.refs.desIn.value;

		contract.add.sendTransaction(name, descr, (e, data) => {
			console.log(e, data);
		})
	}

	render() {
		const appsItems = this.state.apps.map(app => {
			return (
				<div key={app.name}>
					<p>name: {app.name}</p>
					<p>description {app.description}</p>
				</div>
				)
		})

		return (
			<span>
				<div>Application list</div>
				<input ref="nameIn" placeholder="Name" />
				<input ref="desIn" placeholder="Description" /> <button onClick={this.addApp}>Add app</button>
				<p>Apps: </p>
				{appsItems}
			</span>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('root'))
