import React, { Component } from 'react'

class Navbar extends Component {

  render() {
    return (
      <div>

        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            EthSwap
          </a>

            <div>
                <ul className="navbar-nav px-3">
                    <li className="nav-item flex-nowrap d-none d-sm-none d-sm-block">
                        <small className="navbar-text">
                            Your account: {this.props.account}
                        </small>
                    </li>
                </ul>

            </div>
         
        </nav>
     
      </div>
    );
  }
}

export default Navbar;
