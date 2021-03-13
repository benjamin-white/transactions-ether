const Marketplace = artifacts.require('./Marketplace.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('Marketplace', ([deployer, seller, buyer]) => {

  let marketplace;

  before(async () => {
    marketplace = await Marketplace.deployed();
  });

  describe('Deployment', async () => {

    it('deploys successfully', async () => {

      const address = await marketplace.address;

      assert.notEqual(address, '0x0');
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);

    });

    it('has the correct name', async () => {

      const name = await marketplace.name();
      assert.equal(name, 'DAPP Starter');

    });

  });

  describe('Products', async () => {

    let result, productCount;

    before(async () => {
      result       = await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), { from: seller });
      productCount = await marketplace.productCount();
    });

    it('creates products', () => {

      assert.equal(productCount, 1);
      const event = result.logs[0].args;
      assert.equal(Number(event.id), productCount, 'with correct ID');
      assert.equal(event.name, 'iPhone X', 'stores correct name');
      assert.equal(event.price, '1000000000000000000', 'with a correct price');
      assert.equal(event.owner, seller, 'and has the correct owner address');
      assert.equal(event.purchased, false, 'with the correct status');

    });

    it('rejects invalid products', async () => {

      await await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller })
        .should.be.rejected;
      await await marketplace.createProduct('iPhone X', 0, { from: seller })
        .should.be.rejected;

    });

    it('handles a product sale', async () => {

      let previousBalance = await web3.eth.getBalance(seller);
      previousBalance     = new web3.utils.BN(previousBalance);
      let result          = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') });
      const event         = result.logs[0].args;

      assert.equal(Number(event.id), productCount, 'creates the correct ID');
      assert.equal(event.name, 'iPhone X', 'creates the correct name');
      assert.equal(event.price, '1000000000000000000', 'with a correct price');
      assert.equal(event.owner, buyer, 'and has the correct owner address');
      assert.equal(event.purchased, true, 'with the correct status');

      let newBalance        = await web3.eth.getBalance(seller);
      newBalance            = new web3.utils.BN(newBalance);
      let price             = web3.utils.toWei('1', 'Ether');
      price                 = new web3.utils.BN(price);
      const expectedBalance = previousBalance.add(price);

      assert.equal(expectedBalance.toString(), newBalance.toString(), 'and updates seller balance correctly.');

    });

    it('validates purchases', async () => {

      await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') })
        .should.be.rejected; // invalid product index
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('.5', 'Ether') })
        .should.be.rejected; // insufficient ETH
      await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') })
        .should.be.rejected; // cannot be purchased twice
      await marketplace.purchaseProduct(productCount, { from: seller, value: web3.utils.toWei('1', 'Ether') })
        .should.be.rejected; // buyer cannot be seller

    });

  });

})