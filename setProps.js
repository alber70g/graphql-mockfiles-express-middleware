const setProps = ([path, ...rest], obj, value) => {
  if (rest.length === 0) {
    // last one
    // only set if not set yet (with per-property values)
    if (!obj[path]) {
      obj[path] = value;
    }
  } else if (!obj[path]) {
    // obj[path] isn't a value yet
    obj[path] = {};
    setProps(rest, obj[path], value);
  } else if (Array.isArray(obj[path])) {
    // if it's an array add the value to each value
    obj[path].forEach((el, i) => {
      setProps(rest, obj[path][i], value);
    });
  } else {
    setProps(rest, obj[path], value);
  }
};

exports.setProps = setProps;
