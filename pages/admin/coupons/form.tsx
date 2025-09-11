import { useState, useEffect } from 'react';
import { ICoupon } from '../../../lib/coupon';

interface CouponFormProps {
  initialData?: ICoupon; // For edit mode
  onSubmit: (data: any) => void;
  isEditMode?: boolean;
}

const CouponForm = ({ initialData, onSubmit, isEditMode = false }: CouponFormProps) => {
  const [code, setCode] = useState(initialData?.code || '');
  const [discountType, setDiscountType] = useState<ICoupon['discountType']>(initialData?.discountType || 'percentage');
  const [value, setValue] = useState(initialData?.value || 0);
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate ? new Date(initialData.expirationDate).toISOString().split('T')[0] : '');
  const [maxUses, setMaxUses] = useState(initialData?.maxUses || 1);
  const [applicableTo, setApplicableTo] = useState<ICoupon['applicableTo']>(initialData?.applicableTo || 'all');
  const [applicableItems, setApplicableItems] = useState(initialData?.applicableItems?.join(', ') || '');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(initialData?.minPurchaseAmount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      code: code.toUpperCase(),
      discountType,
      value: Number(value),
      expirationDate: new Date(expirationDate),
      maxUses: Number(maxUses),
      applicableTo,
      applicableItems: applicableItems.split(',').map(item => item.trim()).filter(item => item.length > 0),
      minPurchaseAmount: Number(minPurchaseAmount),
      ...(isEditMode && initialData?._id && { _id: initialData._id }), // Include _id for edit mode
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código</label>
        <input
          type="text"
          id="code"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          disabled={isEditMode} // Code cannot be changed in edit mode
        />
      </div>

      <div>
        <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">Tipo de Descuento</label>
        <select
          id="discountType"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as ICoupon['discountType'])}
          required
        >
          <option value="percentage">Porcentaje</option>
          <option value="fixed">Monto Fijo</option>
        </select>
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor</label>
        <input
          type="number"
          id="value"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          required
          min="0"
        />
      </div>

      <div>
        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
        <input
          type="date"
          id="expirationDate"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">Cantidad Máxima de Usos</label>
        <input
          type="number"
          id="maxUses"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={maxUses}
          onChange={(e) => setMaxUses(Number(e.target.value))}
          required
          min="1"
        />
      </div>

      <div>
        <label htmlFor="minPurchaseAmount" className="block text-sm font-medium text-gray-700">Monto Mínimo de Compra (Opcional)</label>
        <input
          type="number"
          id="minPurchaseAmount"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={minPurchaseAmount}
          onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
          min="0"
        />
      </div>

      <div>
        <label htmlFor="applicableTo" className="block text-sm font-medium text-gray-700">Aplicable a</label>
        <select
          id="applicableTo"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={applicableTo}
          onChange={(e) => setApplicableTo(e.target.value as ICoupon['applicableTo'])}
          required
        >
          <option value="all">Toda la Compra</option>
          <option value="products">Productos Específicos</option>
          <option value="categories">Categorías Específicas</option>
        </select>
      </div>

      {(applicableTo === 'products' || applicableTo === 'categories') && (
        <div>
          <label htmlFor="applicableItems" className="block text-sm font-medium text-gray-700">IDs de Productos o Slugs de Categorías (separados por comas)</label>
          <input
            type="text"
            id="applicableItems"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={applicableItems}
            onChange={(e) => setApplicableItems(e.target.value)}
            placeholder="ej: prod123, prod456 o agendas, libretas"
          />
        </div>
      )}

      <button
        type="submit"
        className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition"
      >
        {isEditMode ? 'Actualizar Cupón' : 'Crear Cupón'}
      </button>
    </form>
  );
};

export default CouponForm;
