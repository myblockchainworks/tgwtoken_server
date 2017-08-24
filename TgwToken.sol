pragma solidity ^0.4.11;

library SafeMath {
    function mul(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal constant returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal constant returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

interface IERC20 {

    function totalSupply() constant returns (uint256);
    function balanceOf(address who) constant returns (uint256);
    function transfer(address to, uint256 value);
    function transferFrom(address from, address to, uint256 value);
    function approve(address spender, uint256 value);
    function allowance(address owner, address spender) constant returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

}

contract TgwToken is IERC20 {

    using SafeMath for uint256;

    // Token properties
    string public name;
    string public symbol;
    uint public decimals;
    uint public _totalSupply;

    // Crowdsale properties
    uint256 public _crowdsaleSupply;
    uint256 public crowdsaleStartsOn = 1507573801000; // Tue Oct 10 2017 00:00:01
    uint256 public crowdsaleEndsOn = 1510856999000; // Thu Nov 16 2017 23:59:59
    bool public crowdsaleOn = false;

    // ICO Bonus Schedule
    uint256 public fundRaised = 0;

    // Reserved tokens for fuounder, advisors and individual incentives
    uint256 public _founderAndEmployeeSupply;
    uint256 public _advisorsFundSupply;
    uint256 public _individualIncentiveFundSupply;

    // Balances for each account
    mapping (address => uint256) balances;
    // Owner of account approves the transfer of an amount to another account
    mapping (address => mapping(address => uint256)) allowed;

    // Owner of Token
    address public owner;

    // Wallet Address of Token
    address public multisig;

    // 1 ether = 100 TGW token
    uint public PRICE;

    // modifier to allow only owner has full control on the function
    modifier onlyOwnder {
        require(msg.sender == owner);
        _;
    }

    // Delete / kill the contract... only the owner has rights to do this
    function kill() onlyOwnder {
      suicide(owner);
    }

    // Constructor
    // @notice TgwToken Contract
    // @return the transaction address
    function TgwToken(string _name, string _symbol, uint _decimals, uint _initalSupply, address _multisig, uint _tokenPrice) {

        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _initalSupply;
        multisig = _multisig;
        PRICE = _tokenPrice;

        balances[multisig] = _totalSupply;
        owner = msg.sender;
        crowdsaleOn = true;

        _crowdsaleSupply = _initalSupply.mul(60).div(100);
        _founderAndEmployeeSupply = _initalSupply.mul(30).div(100);
        _advisorsFundSupply = _initalSupply.mul(5).div(100);
        _individualIncentiveFundSupply = _initalSupply.mul(5).div(100);
    }

    // Payable method
    // @notice Anyone can buy the tokens on crowdsale by paying ether
    function () payable {
        crowdsale(msg.sender);
    }

    // @notice crowdsale
    // @param recipient The address of the recipient
    // @return the transaction address and send the event as Transfer
    function crowdsale(address recipient) payable {
        require (
            msg.value > 0 && crowdsaleOn
        );

        //Calculte ICO Bonus Schedule

        fundRaised = fundRaised.add(msg.value);

        uint bonusRate = 1;
        uint raisedFundEther = fundRaised.div(1 ether);
        if (raisedFundEther <= 500) {
            bonusRate = 15;
        } else if (raisedFundEther <= 1000) {
            bonusRate = 10;
        } else if (raisedFundEther <= 1300) {
            bonusRate = 5;
        }

        uint tokens = msg.value.mul(getPrice());
        tokens = tokens.div(1 ether);

        uint percentage = tokens.mul(bonusRate);
        percentage = percentage.div(100);

        tokens = tokens.add(percentage);

        require (
            _crowdsaleSupply > tokens
        );

        balances[multisig] = balances[multisig].sub(tokens);
        balances[recipient] = balances[recipient].add(tokens);
        _crowdsaleSupply = _crowdsaleSupply.sub(tokens);
        Transfer(multisig, recipient, tokens);

        multisig.transfer(msg.value);
    }

    // @return total tokens supplied
    function totalSupply() constant returns (uint256) {
        return _totalSupply;
    }

    // @return total crowdsale tokens supplied
    function crowdsaleSupply() constant returns (uint256) {
        return _crowdsaleSupply;
    }

    // @return total founder and employee tokens supplied
    function founderAndEmployeeSupply() constant returns (uint256) {
        return _founderAndEmployeeSupply;
    }

    // @return total advisors fund tokens supplied
    function advisorsFundSupply() constant returns (uint256) {
        return _advisorsFundSupply;
    }

    // @return total individual incentive fund tokens supplied
    function individualIncentiveFundSupply() constant returns (uint256) {
        return _individualIncentiveFundSupply;
    }

    // What is the balance of a particular account?
    // @param who The address of the particular account
    // @return the balanace the particular account
    function balanceOf(address who) constant returns (uint256) {
        return balances[who];
    }

    // @notice send `value` token to `to` from `msg.sender`
    // @param to The address of the recipient
    // @param value The amount of token to be transferred
    // @return the transaction address and send the event as Transfer
    function transfer(address to, uint256 value) {
        require (
            balances[msg.sender] >= value && value > 0
        );
        balances[msg.sender] = balances[msg.sender].sub(value);
        balances[to] = balances[to].add(value);
        Transfer(msg.sender, to, value);
    }

    // @notice send `value` token to `to` from `from`
    // @param from The address of the sender
    // @param to The address of the recipient
    // @param value The amount of token to be transferred
    // @return the transaction address and send the event as Transfer
    function transferFrom(address from, address to, uint256 value) {
        require (
            allowed[from][msg.sender] >= value && balances[from] >= value && value > 0
        );
        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        allowed[from][msg.sender] = allowed[from][msg.sender].sub(value);
        Transfer(from, to, value);
    }

    // Allow spender to withdraw from your account, multiple times, up to the value amount.
    // If this function is called again it overwrites the current allowance with value.
    // @param spender The address of the sender
    // @param value The amount to be approved
    // @return the transaction address and send the event as Approval
    function approve(address spender, uint256 value) {
        require (
            balances[msg.sender] >= value && value > 0
        );
        allowed[msg.sender][spender] = value;
        Approval(msg.sender, spender, value);
    }

    // Start or Resume Crowdsale action
    function startCrowdsale() onlyOwnder{
      crowdsaleOn = true;
    }

    // Pause or Stop Crowdsale action
    function pauseCrowdsale() onlyOwnder{
      crowdsaleOn = false;
    }

    // Check the allowed value for the spender to withdraw from owner
    // @param owner The address of the owner
    // @param spender The address of the spender
    // @return the amount which spender is still allowed to withdraw from owner
    function allowance(address owner, address spender) constant returns (uint256) {
        return allowed[owner][spender];
    }

    // Get current price of a Token
    // @return the price or token value for a ether
    function getPrice() constant returns (uint result) {
      return PRICE;
    }

    // Get crowdsale start date
    function getCrowdsaleStartDate() constant returns (uint256) {
      return crowdsaleStartsOn;
    }

    // Get crowdsale end date
    function getCrowdsaleEndDate() constant returns (uint256) {
      return crowdsaleEndsOn;
    }
}
