import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useProductMutations } from "@/hooks/useProductMutations";
import { formatRupees } from "@/lib/format";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  price_per_unit: string;
  unit: string;
}

const emptyForm: ProductForm = { name: "", price_per_unit: "", unit: "Litre" };

export default function ProductManagement() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const { addProduct, updateProduct, deleteProduct } = useProductMutations();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const handleAdd = () => {
    const price = Math.round(Number(form.price_per_unit) * 100);
    if (!form.name.trim() || price <= 0) {
      toast.error("Please fill in all fields correctly");
      return;
    }
    addProduct.mutate(
      { name: form.name.trim(), price_per_unit: price, unit: form.unit || "Litre" },
      {
        onSuccess: () => {
          toast.success("Product added!");
          setForm(emptyForm);
          setShowAdd(false);
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!editId) return;
    const price = Math.round(Number(form.price_per_unit) * 100);
    if (!form.name.trim() || price <= 0) {
      toast.error("Please fill in all fields correctly");
      return;
    }
    updateProduct.mutate(
      { id: editId, name: form.name.trim(), price_per_unit: price, unit: form.unit || "Litre" },
      {
        onSuccess: () => {
          toast.success("Product updated!");
          setEditId(null);
          setForm(emptyForm);
        },
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remove "${name}"? This will deactivate the product.`)) return;
    deleteProduct.mutate(id, {
      onSuccess: () => toast.success("Product removed"),
    });
  };

  const startEdit = (p: any) => {
    setEditId(p.id);
    setForm({ name: p.name, price_per_unit: String(p.price_per_unit / 100), unit: p.unit || "Litre" });
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/merchant")} className="active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <Package className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Products</span>
          </div>
          <button
            onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm(emptyForm); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 animate-reveal">
        {/* Add form */}
        {showAdd && (
          <div className="rounded-xl border border-primary/30 bg-card p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-medium text-foreground">New Product</h3>
            <ProductFormFields form={form} setForm={setForm} />
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={addProduct.isPending}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-40">
                {addProduct.isPending ? "Adding..." : "Add Product"}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary active:scale-[0.98]">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Product list */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No products yet. Add one above!</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) =>
              editId === p.id ? (
                <div key={p.id} className="rounded-xl border border-primary/30 bg-card p-4 shadow-sm space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Edit Product</h3>
                  <ProductFormFields form={form} setForm={setForm} />
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} disabled={updateProduct.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-40">
                      <Check className="h-3.5 w-3.5" />
                      {updateProduct.isPending ? "Saving..." : "Save"}
                    </button>
                    <button onClick={cancelEdit}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary active:scale-[0.98]">
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatRupees(p.price_per_unit)} / {p.unit || "Litre"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => startEdit(p)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductFormFields({ form, setForm }: { form: ProductForm; setForm: (f: ProductForm) => void }) {
  return (
    <>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Product name"
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          value={form.price_per_unit}
          onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })}
          placeholder="Price in ₹"
          step="0.01"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          placeholder="Unit (e.g. Litre)"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </>
  );
}
