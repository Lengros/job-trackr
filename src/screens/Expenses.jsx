import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import PageTransition from '../components/PageTransition'
import styles from '../styles/Expenses.module.css'

export default function Expenses() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const jobExpenses = state.expenses.filter((e) => e.jobId === Number(jobId))
  const totalExpenses = jobExpenses.reduce(
    (sum, e) => sum + e.quantity * e.unitPrice,
    0
  )

  // Live preview of line total as user types
  const qtyNum = Number(quantity) || 0
  const priceNum = Number(unitPrice) || 0
  const liveLineTotal = qtyNum > 0 && priceNum > 0 ? (Math.round(qtyNum * priceNum * 100) / 100) : 0

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Item name is required'
    if (!quantity && quantity !== 0) {
      newErrors.quantity = 'Quantity is required'
    } else if (Number(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    } else if (!Number.isFinite(Number(quantity))) {
      newErrors.quantity = 'Please enter a valid number'
    }
    if (!unitPrice && unitPrice !== 0) {
      newErrors.unitPrice = 'Unit price is required'
    } else if (Number(unitPrice) < 0) {
      newErrors.unitPrice = 'Unit price cannot be negative'
    } else if (Number(unitPrice) <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0'
    } else if (!Number.isFinite(Number(unitPrice))) {
      newErrors.unitPrice = 'Please enter a valid price'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    if (editingId) {
      dispatch({
        type: 'UPDATE_EXPENSE',
        payload: {
          id: editingId,
          name: name.trim(),
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        },
      })
      setEditingId(null)
    } else {
      dispatch({
        type: 'ADD_EXPENSE',
        payload: {
          jobId: Number(jobId),
          name: name.trim(),
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        },
      })
    }
    setName('')
    setQuantity('')
    setUnitPrice('')
    setErrors({})
  }

  const handleEdit = (expense) => {
    setEditingId(expense.id)
    setName(expense.name)
    setQuantity(String(expense.quantity))
    setUnitPrice(String(expense.unitPrice))
    setErrors({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setQuantity('')
    setUnitPrice('')
    setErrors({})
  }

  const confirmDelete = () => {
    dispatch({
      type: 'DELETE_EXPENSE',
      payload: { expenseId: deleteTarget },
    })
    setDeleteTarget(null)
  }

  return (
    <PageTransition>
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(`/jobs/${jobId}`)}>
        ← Back
      </button>
      <h2 className={styles.title}>Expenses</h2>

      {jobExpenses.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>💰</span>
          <p>No expenses yet</p>
          <p className={styles.emptyHint}>Add your first expense below</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <div className={styles.tableHeader} role="row">
              <span className={styles.colName}>Name</span>
              <span className={styles.colQty}>Qty</span>
              <span className={styles.colPrice}>Unit Price</span>
              <span className={styles.colTotal}>Total</span>
              <span className={styles.colActions}></span>
            </div>
            <div className={styles.list}>
              {jobExpenses.map((expense) => (
                <div key={expense.id} className={styles.row} role="row">
                  <span className={styles.colName} data-label="Name">{expense.name}</span>
                  <span className={styles.colQty} data-label="Qty">{expense.quantity}</span>
                  <span className={styles.colPrice} data-label="Unit Price">${expense.unitPrice.toFixed(2)}</span>
                  <span className={`${styles.colTotal} ${styles.totalValue}`} data-label="Total">${(Math.round(expense.quantity * expense.unitPrice * 100) / 100).toFixed(2)}</span>
                  <span className={styles.colActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(expense)}
                      aria-label="Edit expense"
                    >
                      ✎
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteTarget(expense.id)}
                      aria-label="Delete expense"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.totalBar}>
            <span>Total Expenses</span>
            <span className={styles.totalAmount}>
              ${totalExpenses.toFixed(2)}
            </span>
          </div>
        </>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
        <div className={styles.formField}>
          <label htmlFor="exp-name">Item Name</label>
          <input
            id="exp-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name && e.target.value.trim()) {
                setErrors(prev => { const n = {...prev}; delete n.name; return n })
              }
            }}
            placeholder="e.g. Copper Pipe"
            className={errors.name ? styles.inputError : ''}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label htmlFor="exp-qty">Quantity</label>
            <input
              id="exp-qty"
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value)
                if (errors.quantity && Number(e.target.value) > 0) {
                  setErrors(prev => { const n = {...prev}; delete n.quantity; return n })
                }
              }}
              placeholder="0"
              step="1"
              className={errors.quantity ? styles.inputError : ''}
            />
            {errors.quantity && (
              <span className={styles.error}>{errors.quantity}</span>
            )}
          </div>
          <div className={styles.formField}>
            <label htmlFor="exp-price">Unit Price ($)</label>
            <input
              id="exp-price"
              type="number"
              value={unitPrice}
              onChange={(e) => {
                setUnitPrice(e.target.value)
                if (errors.unitPrice && Number(e.target.value) > 0) {
                  setErrors(prev => { const n = {...prev}; delete n.unitPrice; return n })
                }
              }}
              placeholder="0.00"
              step="0.01"
              className={errors.unitPrice ? styles.inputError : ''}
            />
            {errors.unitPrice && (
              <span className={styles.error}>{errors.unitPrice}</span>
            )}
          </div>
        </div>
        {liveLineTotal > 0 && (
          <div className={styles.liveTotal}>
            <span className={styles.liveTotalLabel}>Line Total:</span>
            <span className={styles.liveTotalValue}>${liveLineTotal.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.formActions}>
          {editingId && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
          <button type="submit" className={styles.submitButton}>
            {editingId ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>

      {deleteTarget !== null && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <p>Delete this expense?</p>
            <div className={styles.dialogButtons}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
