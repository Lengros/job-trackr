import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings, formatCurrency } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import { CurrencyDollar, PencilSimple, Trash } from '@phosphor-icons/react'
import styles from '../styles/Expenses.module.css'

export default function Expenses() {
  const { jobId } = useParams()
  const { state, dispatch } = useApp()
  const strings = useStrings()

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
    if (!name.trim()) newErrors.name = strings.validation.nameRequired
    if (!quantity && quantity !== 0) {
      newErrors.quantity = strings.validation.quantityRequired
    } else if (Number(quantity) <= 0) {
      newErrors.quantity = strings.validation.quantityPositive
    } else if (!Number.isFinite(Number(quantity))) {
      newErrors.quantity = strings.validation.quantityInvalid
    }
    if (!unitPrice && unitPrice !== 0) {
      newErrors.unitPrice = strings.validation.priceRequired
    } else if (Number(unitPrice) < 0) {
      newErrors.unitPrice = strings.validation.priceNegative
    } else if (Number(unitPrice) <= 0) {
      newErrors.unitPrice = strings.validation.pricePositive
    } else if (!Number.isFinite(Number(unitPrice))) {
      newErrors.unitPrice = strings.validation.priceInvalid
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      haptic.error()
      return
    }

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
      <h2 className={styles.title}>{strings.expenses.title}</h2>

      {jobExpenses.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true"><CurrencyDollar size={48} /></span>
          <p>{strings.expenses.noExpenses}</p>
          <p className={styles.emptyHint}>{strings.expenses.addFirstExpense}</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper} role="table" aria-label={strings.expenses.listLabel}>
            <div className={styles.tableHeader} role="row">
              <span className={styles.colName} role="columnheader">{strings.expenses.colName}</span>
              <span className={styles.colQty} role="columnheader">{strings.expenses.colQty}</span>
              <span className={styles.colPrice} role="columnheader">{strings.expenses.colUnitPrice}</span>
              <span className={styles.colTotal} role="columnheader">{strings.expenses.colTotal}</span>
              <span className={styles.colActions} role="columnheader"><span className="sr-only">{strings.expenses.colActions}</span></span>
            </div>
            <div className={styles.list}>
              {jobExpenses.map((expense) => (
                <div key={expense.id} className={styles.row} role="row">
                  <span className={styles.colName} data-label={strings.expenses.colName} role="cell">{expense.name}</span>
                  <span className={styles.colQty} data-label={strings.expenses.colQty} role="cell">{expense.quantity}</span>
                  <span className={styles.colPrice} data-label={strings.expenses.colUnitPrice} role="cell">{formatCurrency(expense.unitPrice)}</span>
                  <span className={`${styles.colTotal} ${styles.totalValue}`} data-label={strings.expenses.colTotal} role="cell">{formatCurrency(Math.round(expense.quantity * expense.unitPrice * 100) / 100)}</span>
                  <span className={styles.colActions} role="cell">
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(expense)}
                      aria-label={strings.aria.editExpense.replace('{name}', expense.name)}
                    >
                      <PencilSimple size={16} aria-hidden="true" />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteTarget(expense.id)}
                      aria-label={strings.aria.deleteExpense.replace('{name}', expense.name)}
                    >
                      <Trash size={16} aria-hidden="true" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.totalBar}>
            <span>{strings.expenses.totalExpenses}</span>
            <span className={styles.totalAmount}>
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>{editingId ? strings.expenses.editExpense : strings.expenses.addExpense}</h3>
        <div className={styles.formField}>
          <label htmlFor="exp-name">{strings.expenses.itemName}</label>
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
            placeholder={strings.expenses.placeholderName}
            className={errors.name ? styles.inputError : ''}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'exp-name-error' : undefined}
            autoComplete="off"
            enterKeyHint="done"
          />
          {errors.name && <span id="exp-name-error" className={styles.error} role="alert">{errors.name}</span>}
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label htmlFor="exp-qty">{strings.expenses.quantity}</label>
            <input
              id="exp-qty"
              type="number"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value)
                if (errors.quantity && Number(e.target.value) > 0) {
                  setErrors(prev => { const n = {...prev}; delete n.quantity; return n })
                }
              }}
              placeholder={strings.expenses.placeholderQty}
              step="1"
              className={errors.quantity ? styles.inputError : ''}
              aria-invalid={!!errors.quantity}
              aria-describedby={errors.quantity ? 'exp-qty-error' : undefined}
              enterKeyHint="done"
            />
            {errors.quantity && (
              <span id="exp-qty-error" className={styles.error} role="alert">{errors.quantity}</span>
            )}
          </div>
          <div className={styles.formField}>
            <label htmlFor="exp-price">{strings.expenses.unitPrice}</label>
            <input
              id="exp-price"
              type="number"
              inputMode="decimal"
              value={unitPrice}
              onChange={(e) => {
                setUnitPrice(e.target.value)
                if (errors.unitPrice && Number(e.target.value) > 0) {
                  setErrors(prev => { const n = {...prev}; delete n.unitPrice; return n })
                }
              }}
              placeholder={strings.expenses.placeholderPrice}
              step="0.01"
              className={errors.unitPrice ? styles.inputError : ''}
              aria-invalid={!!errors.unitPrice}
              aria-describedby={errors.unitPrice ? 'exp-price-error' : undefined}
              enterKeyHint="done"
            />
            {errors.unitPrice && (
              <span id="exp-price-error" className={styles.error} role="alert">{errors.unitPrice}</span>
            )}
          </div>
        </div>
        {liveLineTotal > 0 && (
          <div className={styles.liveTotal}>
            <span className={styles.liveTotalLabel}>{strings.expenses.lineTotal}</span>
            <span className={styles.liveTotalValue}>{formatCurrency(liveLineTotal)}</span>
          </div>
        )}
        <div className={styles.formActions}>
          {editingId && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancelEdit}
            >
              {strings.confirm.cancel}
            </button>
          )}
          <button type="submit" className={styles.submitButton}>
            {editingId ? strings.expenses.saveChanges : strings.expenses.addExpense}
          </button>
        </div>
      </form>

      {deleteTarget !== null && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={strings.confirm.expenseDeletion}>
          <div className={styles.dialog}>
            <p>{strings.confirm.deleteExpense}</p>
            <div className={styles.dialogButtons}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
              >
                {strings.confirm.cancel}
              </button>
              <button className={styles.confirmBtn} onClick={confirmDelete}>
                {strings.confirm.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
