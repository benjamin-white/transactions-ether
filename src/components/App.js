import Web3                 from 'web3';
import React, { Component } from 'react';
import logo                 from '../logo.png';
import './App.css';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  loadWeb3() {

    if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      return;
    }

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      return;
    }

    this.setState({ envNoSupport: true });

  }

  async loadBlockchainData() {

    if (this.state.envNoSupport) return;

    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();

    console.log(accounts);

  }

  render() {

    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <img src={ logo } className="App-logo" alt="logo" />
              <h1>{ this.state.envNoSupport ? 'Please enable Web3' : 'Transactions - Ether' }</h1>
            </div>
          </main>
        </div>
      </div>
    );

  }

}

export default App;
