

exports.weakGenerate = function(chars) {
  var result = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < chars; ++i) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return result;
};