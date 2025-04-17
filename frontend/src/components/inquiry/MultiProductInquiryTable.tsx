import React from 'react';
import Image from 'next/image';

type MultiProductInquiryTableProps = {
  products: {
    id: string;
    title: string;
    image: string;
    category: string;
    slug: string;
    selected?: boolean;
    quantity?: number;
  }[];
  onProductSelect: (id: string, selected: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}

const MultiProductInquiryTable: React.FC<MultiProductInquiryTableProps> = ({
  products,
  onProductSelect,
  onQuantityChange
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left">Select</th>
            <th className="py-3 px-4 text-left">Image</th>
            <th className="py-3 px-4 text-left">Product</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-left">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-4 px-4">
                <input 
                  type="checkbox" 
                  checked={product.selected || false}
                  onChange={(e) => onProductSelect(product.id, e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td className="py-4 px-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </td>
              <td className="py-4 px-4 font-medium">{product.title}</td>
              <td className="py-4 px-4 text-gray-600">{product.category}</td>
              <td className="py-4 px-4">
                <input 
                  type="number" 
                  min="1" 
                  value={product.quantity || 1}
                  onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 1)}
                  disabled={!product.selected}
                  className="w-20 py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MultiProductInquiryTable;
