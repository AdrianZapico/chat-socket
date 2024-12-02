



export default function OtherImageComponent() {
    return (
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
  {/* Imagem logo centralizada */}
  <img
    style={{ width: '30px', opacity: '0.1' }}
    src="/assets/images/logo.png"
    alt="Funny Chat Logo"
  />
 
  <img
    style={{ width: '100px', opacity: '0.1', marginTop: '5px' }}
    src="/assets/images/cardName.png"
    alt="Funny Chat Card"
  />
</div>

      
    )
}
