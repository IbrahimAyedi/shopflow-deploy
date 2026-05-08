package com.shopflow.service;

import com.shopflow.dto.AddressRequest;
import com.shopflow.dto.AddressResponse;
import com.shopflow.entity.Address;
import com.shopflow.entity.User;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.AddressMapper;
import com.shopflow.repository.AddressRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository    userRepository;
    private final AddressMapper     addressMapper;

    // ─── Add ────────────────────────────────────────────────────────────────

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // If this new address is principal, unset all existing principal addresses first
        if (request.isPrincipal()) {
            unsetAllPrincipal(userId);
        }

        Address address = Address.builder()
                .rue(request.getRue())
                .ville(request.getVille())
                .codePostal(request.getCodePostal())
                .pays(request.getPays())
                .principal(request.isPrincipal())
                .user(user)
                .build();

        return addressMapper.toResponse(addressRepository.save(address));
    }

    // ─── Read ────────────────────────────────────────────────────────────────

    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Set Principal ───────────────────────────────────────────────────────

    @Transactional
    public AddressResponse setPrincipal(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException("Address " + addressId + " does not belong to user " + userId);
        }

        unsetAllPrincipal(userId);
        address.setPrincipal(true);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    // ─── Delete ──────────────────────────────────────────────────────────────

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException("Address " + addressId + " does not belong to user " + userId);
        }

        addressRepository.delete(address);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private void unsetAllPrincipal(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(a -> a.setPrincipal(false));
        addressRepository.saveAll(addresses);
    }
}
