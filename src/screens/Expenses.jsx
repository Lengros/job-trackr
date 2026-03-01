import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings, useCurrencyFormatter } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import EmptyState from '../components/EmptyState'
import { CurrencyDollar, Trash, Plus } from '@phosphor-icons/react'
import styles from '../styles/Expenses.module.css'

const AUTOCOMPLETE_SUGGESTIONS = [
  'Copper Pipe', 'PVC Pipe', 'Wire', 'Screws', 'Nails',
  'Paint', 'Drywall', 'Teflon Tape', 'Sealant', 'Faucet',
  'Light Fixture', 'Cable', 'Joint Compound', 'Wood Studs',
]

export default function Expenses() {
  const { jobId } = useParams()
  const { state, dispatch } = useApp()
  const strings = useStrings()
  const formatCurrency = useCurrencyFormatter()

  const [editingId, setEditingId] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Inline editing state
  const [editName, setEditName] = useState('')
  const [editQty, setEditQty] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [errors, setErrors] = useState({})

  const titleInputRef = useRef(null)
  const qtyInputRef = useRef(null)
  const priceInputRef = useRef(null)

  const jobExpenses = state.expenses.filter((e) => e.jobId === Number(jobId))
  const totalExpenses = jobExpenses.reduce(
    (sum, e) => sum + e.quantity * e.unitPrice,
    0
  )

  // Auto-focus title input when adding new or editing
  useEffect(() => {
    if (addingNew && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [addingNew])

  useEffect(() => {
    if (editingId && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [editingId])

  // Compute live line total
  const qtyNum = Number(editQty) || 0
  const priceNum = Number(editPrice) || 0
  const liveLineTotal = qtyNum > 0 && priceNum > 0 ? Math.round(qtyNum * priceNum * 100) / 100 : 0

  // Filter autocomplete suggestions based on current input
  const filteredSuggestions = editName.length > 0
    ? AUTOCOMPLETE_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(editName.toLowerCase()) &&
        s.toLowerCase() !== editName.toLowerCase()
      ).slice(0, 6)
    : []

  const handleStartAdd = () => {
    // Auto-save if editing something
    if (editingId) {
      saveCurrentEdit()
    }
    setAddingNew(true)
    setEditingId(null)
    setEditName('')
    setEditQty('1')
    setEditPrice('')
    setErrors({})
  }

  const handleStartEdit = (expense) => {
    if (editingId === expense.id) return
    // Auto-save current edit if any
    if (editingId) {
      saveCurrentEdit()
    }
    if (addingNew) {
      saveNewExpense()
    }
    setAddingNew(false)
    setEditingId(expense.id)
    setEditName(expense.name)
    setEditQty(String(expense.quantity))
    setEditPrice(String(expense.unitPrice))
    setErrors({})
  }

  const validate = () => {
    const newErrors = {}
    if (!editName.trim()) newErrors.name = strings.validation.nameRequired
    if (!editQty && editQty !== '0') {
      newErrors.quantity = strings.validation.quantityRequired
    } else if (Number(editQty) <= 0) {
      newErrors.quantity = strings.validation.quantityPositive
    }
    if (!editPrice && editPrice !== '0') {
      newErrors.unitPrice = strings.validation.priceRequired
    } else if (Number(editPrice) < 0) {
      newErrors.unitPrice = strings.validation.priceNegative
    } else if (Number(editPrice) <= 0) {
      newErrors.unitPrice = strings.validation.pricePositive
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveCurrentEdit = () => {
    if (!editingId) return
    if (!editName.trim() || Number(editQty) <= 0 || Number(editPrice) <= 0) {
      setEditingId(null)
      setErrors({})
      return
    }
    dispatch({
      type: 'UPDATE_EXPENSE',
      payload: {
        id: editingId,
        name: editName.trim(),
        quantity: Number(editQty),
        unitPrice: Number(editPrice),
      },
    })
    setEditingId(null)
    setErrors({})
  }

  const saveNewExpense = () => {
    if (!addingNew) return
    if (!editName.trim() || Number(editQty) <= 0 || Number(editPrice) <= 0) {
      setAddingNew(false)
      return
    }
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        jobId: Number(jobId),
        name: editName.trim(),
        quantity: Number(editQty),
        unitPrice: Number(editPrice),
      },
    })
    haptic.success()
    setAddingNew(false)
    setEditName('')
    setEditQty('')
    setEditPrice('')
    setErrors({})
  }

  const handleBlur = (e) => {
    // Delay blur to allow clicking other inputs in the same row or chips
    setTimeout(() => {
      const activeEl = document.activeElement
      const editRow = e.target.closest('[data-editing-row]')
      if (editRow && editRow.contains(activeEl)) return

      // Auto-save on blur
      if (addingNew) {
        saveNewExpense()
      } else if (editingId) {
        saveCurrentEdit()
      }
    }, 200)
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      qtyInputRef.current?.focus()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      qtyInputRef.current?.focus()
    }
  }

  const handleQtyKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      priceInputRef.current?.focus()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      priceInputRef.current?.focus()
    }
  }

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (addingNew) {
        if (validate()) {
          saveNewExpense()
        } else {
          haptic.error()
        }
      } else if (editingId) {
        saveCurrentEdit()
      }
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setEditName(suggestion)
    setTimeout(() => qtyInputRef.current?.focus(), 50)
  }

  const confirmDelete = () => {
    dispatch({
      type: 'DELETE_EXPENSE',
      payload: { expenseId: deleteTarget },
    })
    if (editingId === deleteTarget) {
      setEditingId(null)
    }
    setDeleteTarget(null)
  }

  const renderEditableRow = (isNew) => (
    <div className={styles.editRow} data-editing-row>
      <div className={styles.editTitleRow}>
        <input
          ref={titleInputRef}
          type="text"
          className={`${styles.inlineInput} ${styles.titleInput} ${errors.name ? styles.inputError : ''}`}
          value={editName}
          onChange={(e) => {
            setEditName(e.target.value)
            if (errors.name) setErrors(prev => { const n = {...prev}; delete n.name; return n })
          }}
          onBlur={handleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder={strings.expenses.placeholderName}
          autoComplete="off"
          enterKeyHint="next"
          aria-label={strings.expenses.itemName}
          aria-invalid={!!errors.name}
        />
        {!isNew && (
          <button
            className={styles.inlineDeleteBtn}
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(editingId) }}
            aria-label={strings.aria.deleteExpense.replace('{name}', editName)}
          >
            <Trash size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {errors.name && <span className={styles.error} role="alert">{errors.name}</span>}

      {/* Autocomplete suggestions as chips */}
      {filteredSuggestions.length > 0 && (
        <div className={styles.chipScroller}>
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.chip}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}
              tabIndex={-1}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className={styles.editValuesRow}>
        <div className={styles.editField}>
          <label className={styles.miniLabel}>{strings.expenses.colQty}</label>
          <input
            ref={qtyInputRef}
            type="number"
            inputMode="decimal"
            className={`${styles.inlineInput} ${styles.numInput} ${errors.quantity ? styles.inputError : ''}`}
            value={editQty}
            onChange={(e) => {
              setEditQty(e.target.value)
              if (errors.quantity) setErrors(prev => { const n = {...prev}; delete n.quantity; return n })
            }}
            onBlur={handleBlur}
            onKeyDown={handleQtyKeyDown}
            placeholder={strings.expenses.placeholderQty}
            step="1"
            enterKeyHint="next"
            aria-label={strings.expenses.quantity}
            aria-invalid={!!errors.quantity}
          />
          {errors.quantity && <span className={styles.error} role="alert">{errors.quantity}</span>}
        </div>
        <span className={styles.timesSign}>×</span>
        <div className={styles.editField}>
          <label className={styles.miniLabel}>{strings.expenses.colUnitPrice}</label>
          <input
            ref={priceInputRef}
            type="number"
            inputMode="decimal"
            className={`${styles.inlineInput} ${styles.numInput} ${errors.unitPrice ? styles.inputError : ''}`}
            value={editPrice}
            onChange={(e) => {
              setEditPrice(e.target.value)
              if (errors.unitPrice) setErrors(prev => { const n = {...prev}; delete n.unitPrice; return n })
            }}
            onBlur={handleBlur}
            onKeyDown={handlePriceKeyDown}
            placeholder={strings.expenses.placeholderPrice}
            step="0.01"
            enterKeyHint="done"
            aria-label={strings.expenses.unitPrice}
            aria-invalid={!!errors.unitPrice}
          />
          {errors.unitPrice && <span className={styles.error} role="alert">{errors.unitPrice}</span>}
        </div>
        <span className={styles.editTotal}>
          {liveLineTotal > 0 ? formatCurrency(liveLineTotal) : '—'}
        </span>
      </div>
    </div>
  )

  return (
    <PageTransition>
    <div className={styles.container}>
      <h2 className={styles.title}>{strings.expenses.title}</h2>

      {jobExpenses.length === 0 && !addingNew ? (
        <EmptyState
          icon={<CurrencyDollar size={48} />}
          title={strings.empty.noExpenses}
          subtitle={strings.empty.noExpensesSubtitle}
          actionLabel={strings.empty.addItem}
          onAction={handleStartAdd}
        />
      ) : (
        <>
          <div className={styles.expenseList} role="list" aria-label={strings.expenses.listLabel}>
            {jobExpenses.map((expense) => {
              const isEditing = editingId === expense.id
              if (isEditing) {
                return (
                  <div key={expense.id} className={`${styles.expenseItem} ${styles.editing}`} role="listitem">
                    {renderEditableRow(false)}
                  </div>
                )
              }
              const lineTotal = Math.round(expense.quantity * expense.unitPrice * 100) / 100
              return (
                <div
                  key={expense.id}
                  className={styles.expenseItem}
                  role="listitem"
                  onClick={() => handleStartEdit(expense)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStartEdit(expense) } }}
                  aria-label={`${expense.name}, ${expense.quantity} × ${formatCurrency(expense.unitPrice)}, total ${formatCurrency(lineTotal)}`}
                >
                  <div className={styles.itemTopRow}>
                    <span className={styles.itemName}>{expense.name}</span>
                    <button
                      className={styles.inlineDeleteBtn}
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(expense.id) }}
                      aria-label={strings.aria.deleteExpense.replace('{name}', expense.name)}
                    >
                      <Trash size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <div className={styles.itemBottomRow}>
                    <span className={styles.itemQtyPrice}>
                      {expense.quantity} × {formatCurrency(expense.unitPrice)}
                    </span>
                    <span className={styles.itemTotal}>{formatCurrency(lineTotal)}</span>
                  </div>
                </div>
              )
            })}

            {addingNew && (
              <div className={`${styles.expenseItem} ${styles.editing}`} role="listitem">
                {renderEditableRow(true)}
              </div>
            )}
          </div>

          {/* Total bar */}
          <div className={styles.totalBar}>
            <span>{strings.expenses.totalExpenses}</span>
            <span className={styles.totalAmount}>
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          {/* Add expense button */}
          {!addingNew && !editingId && (
            <button className={styles.addButton} onClick={handleStartAdd}>
              <Plus size={18} weight="bold" aria-hidden="true" />
              {strings.expenses.addExpense}
            </button>
          )}
        </>
      )}

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
