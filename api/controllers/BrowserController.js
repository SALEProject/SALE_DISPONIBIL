module.exports = {

  index: function (req, res) {
    return res.view({
      layout:'browserCheckLayout',
      title:'Browser'
    });
	}
};
