import jwt from 'jsonwebtoken';

export const validarJWT = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, msg: 'Token no proporcionado' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ ok: false, msg: 'JWT_SECRET no configurado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, msg: 'Token inválido o expirado' });
  }
};
