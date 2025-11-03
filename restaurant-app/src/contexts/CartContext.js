import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [mesaId, setMesaId] = useState(null);

  const agregarItem = (platillo, cantidad = 1, notasEspeciales = '') => {
    setItems((prevItems) => {
      // Verificar si el platillo ya existe en el carrito
      const itemExistente = prevItems.find(
        (item) =>
          item.platillo_id === platillo.id &&
          item.notas_especiales === notasEspeciales
      );

      if (itemExistente) {
        // Incrementar cantidad
        return prevItems.map((item) =>
          item.platillo_id === platillo.id &&
          item.notas_especiales === notasEspeciales
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Agregar nuevo item
        return [
          ...prevItems,
          {
            platillo_id: platillo.id,
            nombre: platillo.nombre,
            precio: platillo.precio,
            imagen_url: platillo.imagen_url,
            cantidad,
            notas_especiales: notasEspeciales,
          },
        ];
      }
    });
  };

  const actualizarCantidad = (platilloId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(platilloId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.platillo_id === platilloId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  const eliminarItem = (platilloId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.platillo_id !== platilloId)
    );
  };

  const limpiarCarrito = () => {
    setItems([]);
  };

  const obtenerTotal = () => {
    return items.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  };

  const obtenerCantidadTotal = () => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  const configurarMesa = (id) => {
    setMesaId(id);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        mesaId,
        agregarItem,
        actualizarCantidad,
        eliminarItem,
        limpiarCarrito,
        obtenerTotal,
        obtenerCantidadTotal,
        configurarMesa,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export default CartContext;
