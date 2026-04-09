import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Vistoria } from '../types/vistoria';

// Estilos específicos para o PDF (parecido com CSS, mas próprio para impressão)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', color: '#0056b3' },
  section: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  value: { fontSize: 12, marginBottom: 8, lineHeight: 1.5 },
  divisor: { borderBottom: '1px solid #ccc', marginVertical: 15 },
  ambienteTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#0056b3' },
  fotosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  fotoWrapper: { width: '48%', marginBottom: 10 },
  foto: { width: '100%', height: 150, objectFit: 'cover' }
});

interface Props {
  vistoria: Partial<Vistoria>;
}

// Este é o "desenho" da folha A4
export function RelatorioPDF({ vistoria }: Props) {
  const ambientes = vistoria.ambientes ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Relatório de Vistoria de Imóvel</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Título da Vistoria:</Text>
          <Text style={styles.value}>{vistoria.nomeProjeto}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Processo SEI:</Text>
          <Text style={styles.value}>{vistoria.processoSei}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{vistoria.endereco}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Secretaria:</Text>
          <Text style={styles.value}>{vistoria.secretaria}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data da Vistoria:</Text>
          <Text style={styles.value}>
            {vistoria.dataVistoria ? new Date(vistoria.dataVistoria).toLocaleDateString('pt-BR') : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{vistoria.observacoes}</Text>
        </View>

        <View style={styles.divisor} />

        {ambientes.map((ambiente, index) => (
          <View key={ambiente.id} style={styles.section}>
            <Text style={styles.ambienteTitle}>Ambiente {index + 1}: {ambiente.nome}</Text>
            <View style={styles.fotosContainer}>
              {ambiente.fotos.map((foto) => (
                <View key={foto.id} style={styles.fotoWrapper}>
                  <Image src={foto.dataUrl || foto.url} style={styles.foto} />
                </View>
              ))}
            </View>
          </View>
        ))}

      </Page>
    </Document>
  );
}