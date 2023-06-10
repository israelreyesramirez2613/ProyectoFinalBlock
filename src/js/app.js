App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    $.getJSON('../movies.json', function(data) {
      var petsRow = $('#MoviesRow');
      var petTemplate = $('#MovieTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.movie-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].img);
        petTemplate.find('.movie-category').text(data[i].category);
        petTemplate.find('.movie-release').text(data[i].releaseYear);
        petTemplate.find('.movie-director').text(data[i].director);
        petTemplate.find('.movie-price').text(`${data[i].price} ETH`);
        petTemplate.find('.btn-rent').attr('data-id', data[i].id);
        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
   // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
   $.getJSON('Renta.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with @truffle/contract
  var RentaArtifact = data;
  App.contracts.Renta = TruffleContract(RentaArtifact);

  // Set the provider for our contract
  App.contracts.Renta.setProvider(App.web3Provider);

  // Use our contract to retrieve and mark the adopted pets
  return App.markRentado();
});

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-rent', App.handleRentar);
  },

  markRentado: function() {
    var rentaInstance;

    App.contracts.Renta.deployed().then(function(instance) {
      rentaInstance = instance;
    
      return rentaInstance.getClientes.call();
    }).then(function(clientes) {
      for (i = 0; i < clientes.length; i++) {
        if (clientes[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-movie').eq(i).find('button').text('Success').attr('disabled', true).removeClass('btn-info').addClass('btn-success');
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleRentar: function(event) {
    event.preventDefault();

    var movieId = parseInt($(event.target).data('id'));

    var RentaInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Renta.deployed().then(function(instance) {
        RentaInstance = instance;
        var find = $('.panel-movie').eq(movieId);
        var price = parseInt(find.find('.movie-price').text());
        var weight = web3.toWei(price, 'ether');
        // Execute adopt as a transaction by sending account
        return RentaInstance.rentar(movieId, {from: account,value: weight});
      }).then(function(result) {
        return App.markRentado();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
