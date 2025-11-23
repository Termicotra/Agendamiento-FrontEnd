import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Componente reutilizable para diálogos de confirmación
 */
export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false
}) {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: 'warning.main', 
            width: 64, 
            height: 64, 
            mx: 'auto', 
            mb: 2 
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 32 }} />
        </Avatar>
        
        <DialogTitle sx={{ p: 0, mb: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </DialogTitle>
        
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3, px: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          disableRipple
          sx={{ '&:hover': { bgcolor: 'transparent' } }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={loading}
          disableRipple
          disableElevation
          sx={{ '&:hover': { bgcolor: 'error.main', boxShadow: 'none', color: 'inherit' } }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

