import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(address to, uint256 amount) ERC20("TestToken", "TT") {
        _mint(to, amount);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
