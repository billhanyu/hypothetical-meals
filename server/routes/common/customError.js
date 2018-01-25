export function createError(msg, ...args) {
  const err = {
    custom: msg,
    code: args[0],
  };
  return err;
};

export function handleError(err, res) {
  if (err.custom) {
    const code = err.code || 400;
    return res.status(code).send(err.custom);
  }
  console.error(err);
  res.status(500).send('Database error');
}
